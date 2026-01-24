import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Exam, ExamStatus, ExamType, ExamLevel } from './entities/exam.entity';
import { Question, QuestionType } from './entities/question.entity';
import { ProgrammingQuestion } from './entities/programming-question.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateProgrammingQuestionDto } from './dto/create-programming-question.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(ProgrammingQuestion)
    private programmingQuestionRepository: Repository<ProgrammingQuestion>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate unique exam code
   */
  private async generateExamCode(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const code = `EXAM-${timestamp}-${random}`;

    const existing = await this.examRepository.findOne({ where: { code } });
    if (existing) {
      return this.generateExamCode();
    }

    return code;
  }

  /**
   * Create a new exam (DRAFT status)
   */
  async createExam(createExamDto: CreateExamDto, userId: string, organizationId: string): Promise<Exam> {
    const code = await this.generateExamCode();

    // Validate organizationId is provided
    if (!organizationId) {
      throw new BadRequestException('User does not belong to an organization');
    }

    const exam = this.examRepository.create({
      ...createExamDto,
      code,
      createdBy: userId,
      organizationId: organizationId,
      status: ExamStatus.DRAFT,
      totalQuestions: 0,
      totalMarks: 0,
    });

    return this.examRepository.save(exam);
  }

  /**
   * Get all exams (optionally filtered by organization/user)
   */
  async getExams(userId?: string, role?: string, organizationId?: string): Promise<Exam[]> {
    console.log('getExams called with:', { userId, role, organizationId });
    
    try {
      let query = this.examRepository.createQueryBuilder('exam');

      if (role !== 'SUPER_ADMIN' && organizationId) {
        query = query.where('exam.organizationId = :organizationId', { 
          organizationId: organizationId 
        });
      }

      const exams = await query
        .leftJoinAndSelect('exam.questions', 'questions')
        .leftJoinAndSelect('exam.programmingQuestions', 'programmingQuestions')
        .orderBy('exam.createdAt', 'DESC')
        .getMany();
      
      console.log('getExams returning:', exams.length, 'exams');
      return exams;
    } catch (error) {
      console.error('Error in getExams:', error);
      throw error;
    }
  }

  /**
   * Get a single exam by ID
   */
  async getExamById(id: string): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: ['questions', 'programmingQuestions'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return exam;
  }

  /**
   * Update exam (only allowed in DRAFT status)
   */
  async updateExam(
    id: string,
    updateExamDto: UpdateExamDto,
    userId: string,
    role?: string,
  ): Promise<Exam> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own exams');
    }

    // Only allow updates if DRAFT
    if (exam.status !== ExamStatus.DRAFT) {
      throw new BadRequestException('Can only update exams in DRAFT status');
    }

    Object.assign(exam, updateExamDto);
    return this.examRepository.save(exam);
  }

  /**
   * Delete exam (only in DRAFT status)
   */
  async deleteExam(id: string, userId: string, role?: string): Promise<void> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own exams');
    }

    // Only allow deletion if DRAFT
    if (exam.status !== ExamStatus.DRAFT) {
      throw new BadRequestException('Can only delete exams in DRAFT status');
    }

    await this.examRepository.remove(exam);
  }

  /**
   * Add MCQ question to exam
   */
  async addQuestion(
    examId: string,
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const exam = await this.getExamById(examId);

    // Validate only MCQ exams have MCQ questions
    if (exam.examType !== ExamType.MCQ) {
      throw new BadRequestException(
        'Can only add MCQ questions to MCQ exams',
      );
    }

    const question = this.questionRepository.create({
      ...createQuestionDto,
      exam,
      displayOrder: exam.questions.length,
    });

    const savedQuestion = await this.questionRepository.save(question);

    // Update exam totals
    await this.recalculateExamTotals(examId);

    return savedQuestion;
  }

  /**
   * Update MCQ question
   */
  async updateQuestion(
    examId: string,
    questionId: string,
    updateData: Partial<CreateQuestionDto>,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, examId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found in this exam`,
      );
    }

    Object.assign(question, updateData);
    const updated = await this.questionRepository.save(question);

    // Recalculate totals
    await this.recalculateExamTotals(examId);

    return updated;
  }

  /**
   * Delete MCQ question
   */
  async deleteQuestion(examId: string, questionId: string): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, examId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found in this exam`,
      );
    }

    await this.questionRepository.remove(question);

    // Reorder remaining questions
    const questions = await this.questionRepository.find({
      where: { examId },
      order: { displayOrder: 'ASC' },
    });

    for (let i = 0; i < questions.length; i++) {
      questions[i].displayOrder = i;
    }
    await this.questionRepository.save(questions);

    // Recalculate totals
    await this.recalculateExamTotals(examId);
  }

  /**
   * Add programming question to exam
   */
  async addProgrammingQuestion(
    examId: string,
    createProgrammingQuestionDto: CreateProgrammingQuestionDto,
  ): Promise<ProgrammingQuestion> {
    const exam = await this.getExamById(examId);

    // Validate only Programming exams have programming questions
    if (exam.examType !== ExamType.PROGRAMMING) {
      throw new BadRequestException(
        'Can only add programming questions to programming exams',
      );
    }

    const question = this.programmingQuestionRepository.create({
      ...createProgrammingQuestionDto,
      exam,
      displayOrder: exam.programmingQuestions.length,
    });

    const savedQuestion = await this.programmingQuestionRepository.save(question);

    // Update exam totals
    await this.recalculateExamTotals(examId);

    return savedQuestion;
  }

  /**
   * Update programming question
   */
  async updateProgrammingQuestion(
    examId: string,
    questionId: string,
    updateData: Partial<CreateProgrammingQuestionDto>,
  ): Promise<ProgrammingQuestion> {
    const question = await this.programmingQuestionRepository.findOne({
      where: { id: questionId, examId },
    });

    if (!question) {
      throw new NotFoundException(
        `Programming question with ID ${questionId} not found in this exam`,
      );
    }

    Object.assign(question, updateData);
    const updated = await this.programmingQuestionRepository.save(question);

    // Recalculate totals
    await this.recalculateExamTotals(examId);

    return updated;
  }

  /**
   * Delete programming question
   */
  async deleteProgrammingQuestion(examId: string, questionId: string): Promise<void> {
    const question = await this.programmingQuestionRepository.findOne({
      where: { id: questionId, examId },
    });

    if (!question) {
      throw new NotFoundException(
        `Programming question with ID ${questionId} not found in this exam`,
      );
    }

    await this.programmingQuestionRepository.remove(question);

    // Reorder remaining questions
    const questions = await this.programmingQuestionRepository.find({
      where: { examId },
      order: { displayOrder: 'ASC' },
    });

    for (let i = 0; i < questions.length; i++) {
      questions[i].displayOrder = i;
    }
    await this.programmingQuestionRepository.save(questions);

    // Recalculate totals
    await this.recalculateExamTotals(examId);
  }

  /**
   * Recalculate exam totals (questions count and total marks)
   */
  private async recalculateExamTotals(examId: string): Promise<void> {
    const exam = await this.getExamById(examId);

    let totalQuestions = 0;
    let totalMarks = 0;

    if (exam.examType === ExamType.MCQ) {
      const questions = await this.questionRepository.find({
        where: { examId },
      });
      totalQuestions = questions.length;
      totalMarks = questions.reduce(
        (sum, q) => sum + parseFloat(q.marks.toString()),
        0,
      );
    } else {
      const questions = await this.programmingQuestionRepository.find({
        where: { examId },
      });
      totalQuestions = questions.length;
      totalMarks = questions.reduce(
        (sum, q) => sum + parseFloat(q.maxMarks.toString()),
        0,
      );
    }

    exam.totalQuestions = totalQuestions;
    exam.totalMarks = totalMarks;

    await this.examRepository.save(exam);
  }

  /**
   * Publish exam (change status from DRAFT to PUBLISHED)
   */
  async publishExam(id: string, userId: string, role?: string): Promise<Exam> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only publish your own exams');
    }

    // Validate exam has questions
    if (exam.totalQuestions === 0) {
      throw new BadRequestException('Exam must have at least one question');
    }

    // Can only publish DRAFT exams
    if (exam.status !== ExamStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT exams can be published');
    }

    exam.status = ExamStatus.PUBLISHED;
    return this.examRepository.save(exam);
  }

  /**
   * Duplicate exam
   */
  async duplicateExam(id: string, userId: string): Promise<Exam> {
    const originalExam = await this.getExamById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new exam with duplicated data
      const newCode = await this.generateExamCode();
      const newExam = this.examRepository.create({
        ...originalExam,
        id: undefined,
        code: newCode,
        createdBy: userId,
        status: ExamStatus.DRAFT,
        createdAt: undefined,
        updatedAt: undefined,
      });

      const savedExam = await queryRunner.manager.save(newExam);

      // Duplicate questions based on exam type
      if (originalExam.examType === ExamType.MCQ) {
        const questions = originalExam.questions;
        for (const question of questions) {
          const newQuestion = this.questionRepository.create({
            ...question,
            id: undefined,
            exam: savedExam,
          });
          await queryRunner.manager.save(newQuestion);
        }
      } else {
        const questions = originalExam.programmingQuestions;
        for (const question of questions) {
          const newQuestion = this.programmingQuestionRepository.create({
            ...question,
            id: undefined,
            exam: savedExam,
          });
          await queryRunner.manager.save(newQuestion);
        }
      }

      await queryRunner.commitTransaction();
      return savedExam;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Archive exam (change status to ARCHIVED)
   */
  async archiveExam(id: string, userId: string, role?: string): Promise<Exam> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only archive your own exams');
    }

    exam.status = ExamStatus.ARCHIVED;
    return this.examRepository.save(exam);
  }

  /**
   * Close exam (change status to CLOSED)
   */
  async closeExam(id: string, userId: string, role?: string): Promise<Exam> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only close your own exams');
    }

    exam.status = ExamStatus.CLOSED;
    return this.examRepository.save(exam);
  }
}
