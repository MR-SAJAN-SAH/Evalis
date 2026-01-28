import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Exam, ExamStatus, ExamType, ExamLevel } from './entities/exam.entity';
import { Question, QuestionType } from './entities/question.entity';
import { ProgrammingQuestion } from './entities/programming-question.entity';
import { ExamAccess } from './entities/exam-access.entity';
import { EvaluationMapping } from './entities/evaluation-mapping.entity';
import { ExamSubmission } from './entities/exam-submission.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateProgrammingQuestionDto } from './dto/create-programming-question.dto';
import { PublishExamDto } from './dto/publish-exam.dto';
import { UploadEvaluationMappingDto } from './dto/evaluation-mapping.dto';
import { ExamSubmissionDto } from './dto/exam-submission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(ProgrammingQuestion)
    private programmingQuestionRepository: Repository<ProgrammingQuestion>,
    @InjectRepository(ExamAccess)
    private examAccessRepository: Repository<ExamAccess>,
    @InjectRepository(EvaluationMapping)
    private evaluationMappingRepository: Repository<EvaluationMapping>,
    @InjectRepository(ExamSubmission)
    private examSubmissionRepository: Repository<ExamSubmission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
  async getExams(userId?: string, role?: string, organizationId?: string): Promise<any[]> {
    console.log('🔍 getExams called with:', { userId, role, organizationId });
    
    try {
      let query = this.examRepository.createQueryBuilder('exam');

      // For admins: show all exams (DRAFT, PUBLISHED, etc.)
      // For candidates: only show PUBLISHED exams
      const isCandidateRole = role && (role === 'Candidate' || role === 'CANDIDATE' || role === 'candidate');
      
      if (isCandidateRole) {
        // Candidates only see PUBLISHED exams
        query = query.where('exam.status = :status', { status: 'PUBLISHED' });
        console.log(`📋 Candidate view: filtering for PUBLISHED exams only`);
      } else {
        // Admins see all exams
        console.log(`👨‍💼 Admin view: showing all exam statuses (DRAFT, PUBLISHED, etc.)`);
      }

      if (role !== 'SUPER_ADMIN' && organizationId) {
        query = query.andWhere('exam.organizationId = :organizationId', { 
          organizationId: organizationId 
        });
      }

      const exams = await query
        .leftJoinAndSelect('exam.questions', 'questions')
        .leftJoinAndSelect('exam.programmingQuestions', 'programmingQuestions')
        .orderBy('exam.createdAt', 'DESC')
        .getMany();
      
      console.log(`📦 Database returned ${exams.length} exams`);

      
      // Ensure all questions have allowMultipleCorrect field set
      const examsWithDefaults = exams.map(exam => ({
        ...exam,
        questions: (exam.questions || []).map(q => ({
          ...q,
          allowMultipleCorrect: q.allowMultipleCorrect ?? false,
          correctAnswers: q.correctAnswers ?? [],
        })),
      }));
      
      // For candidates: filter by exam publication date vs candidate creation date
      console.log(`👤 Processing with role: "${role}", userId: "${userId}"`);
      
      console.log(`🔍 Is Candidate role? ${isCandidateRole} (role="${role}")`);
      
      if (userId && isCandidateRole) {
        console.log(`🔒 Applying candidate-specific filtering...`);
        
        // Get the candidate's profile to check their creation date
        const candidate = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (!candidate) {
          console.error(`❌ Candidate ${userId} not found`);
          return [];
        }

        const candidateCreatedAt = new Date(candidate.createdAt);
        console.log(`⏰ Candidate created at: ${candidateCreatedAt.toISOString()}`);

        // Filter exams: only show exams published AFTER candidate was created
        const accessibleExams: any[] = [];
        
        for (const exam of examsWithDefaults) {
          const examPublishedAt = new Date(exam.publishedAt);
          const publishedAfterCreated = examPublishedAt > candidateCreatedAt;
          
          console.log(`\n  📋 Exam: "${exam.name}"`);
          console.log(`     Published: ${examPublishedAt.toISOString()}`);
          console.log(`     Candidate created: ${candidateCreatedAt.toISOString()}`);
          console.log(`     Comparison: ${examPublishedAt.getTime()} > ${candidateCreatedAt.getTime()} = ${publishedAfterCreated}`);
          
          if (publishedAfterCreated) {
            console.log(`     ✅ ALLOWED`);
            accessibleExams.push(exam);
          } else {
            console.log(`     ❌ BLOCKED - published before/at candidate creation`);
          }
        }
        
        console.log(`\n✅ Final result: ${accessibleExams.length} exams visible to candidate`);
        
        // Check submission status for each accessible exam
        const examsWithSubmissionStatus = await Promise.all(
          accessibleExams.map(async (exam) => {
            const submission = await this.examSubmissionRepository.findOne({
              where: {
                examId: exam.id,
                candidateId: userId,
              },
            });
            return {
              ...exam,

              isSubmitted: !!submission, // true if submission exists
            };
          })
        );
        
        console.log('getExams returning:', examsWithSubmissionStatus.length, 'exams with submission status for candidate');
        return examsWithSubmissionStatus;
      }
      
      console.log('getExams returning:', examsWithDefaults.length, 'exams');
      return examsWithDefaults;
    } catch (error) {
      console.error('Error in getExams:', error);
      throw error;
    }
  }

  /**
   * Get candidate's submitted exams with scores and completion details
   */
  async getCandidateSubmissions(candidateId: string): Promise<any[]> {
    try {
      console.log('🎯 getCandidateSubmissions called for candidate:', candidateId);

      // Get all submissions for this candidate
      const submissions = await this.examSubmissionRepository.find({
        where: { candidateId: candidateId },
        relations: ['exam'],
        order: { submittedAt: 'DESC' },
      });

      // Load questions for each exam separately to ensure they're loaded with all fields
      for (const submission of submissions) {
        const examWithQuestions = await this.examRepository
          .createQueryBuilder('exam')
          .leftJoinAndSelect('exam.questions', 'questions')
          .where('exam.id = :examId', { examId: submission.exam.id })
          .select([
            'exam.id',
            'exam.name',
            'exam.examType',
            'exam.totalMarks',
            'exam.passingScore',
            'exam.durationMinutes',
            'questions.id',
            'questions.marks',
            'questions.correctAnswer',
            'questions.correctAnswers',
            'questions.allowMultipleCorrect',
            'questions.questionText',
            'questions.optionA',
            'questions.optionB',
            'questions.optionC',
            'questions.optionD',
            'questions.difficultyLevel',
            'questions.questionType',
            'questions.correctAnswerExplanation',
          ])
          .getOne();
        
        if (examWithQuestions) {
          // Ensure all questions have allowMultipleCorrect field set
          if (examWithQuestions.questions) {
            examWithQuestions.questions = examWithQuestions.questions.map(q => ({
              ...q,
              allowMultipleCorrect: q.allowMultipleCorrect ?? false,
              correctAnswers: q.correctAnswers ?? [],
            }));
          }
          submission.exam = examWithQuestions;
          console.log(`✅ Loaded ${submission.exam.questions?.length || 0} questions for exam ${submission.exam.id}`);
        }
      }

      console.log(`📋 Found ${submissions.length} submissions for candidate`);

      if (submissions.length === 0) {
        console.log('ℹ️ No submissions found');
        return [];
      }

      // Enrich with exam details and calculate scores
      const enrichedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          console.log(`\n📝 Processing submission ${submission.id} for exam ${submission.examId}`);
          
          const exam = submission.exam;
          let score = 0;

          // Calculate score for MCQ exams
          if (exam.examType === 'MCQ') {
            let answers: Record<string, string | string[] | null> = {};
            
            // Parse answers based on their type
            if (typeof submission.answers === 'string') {
              try {
                answers = JSON.parse(submission.answers);
              } catch (e) {
                console.warn('Could not parse answers:', e);
                answers = {};
              }
            } else if (typeof submission.answers === 'object' && submission.answers !== null) {
              answers = submission.answers as Record<string, string | string[] | null>;
            }

            console.log('📊 Calculating score - Answers:', answers);

            const questions = exam.questions || [];
            console.log(`📚 Total questions in exam: ${questions.length}`);

            let correctAnswers = 0;
            let totalMarks = 0;
            let evaluatedCount = 0;

            for (const question of questions) {
              // Ensure marks is a number
              const questionMarks = Number(question.marks) || 1;
              totalMarks += questionMarks;
              
              // Get user's answer for this question
              const userAnswer = answers[question.id];
              const correctAnswer = question.correctAnswer;
              const correctAnswers_arr = question.correctAnswers || [];

              console.log(`  Q${question.id}: user="${userAnswer}" vs correct="${correctAnswer}" / correctAnswers=[${correctAnswers_arr.join(',')}] (${questionMarks} marks) [allowMultiple: ${question.allowMultipleCorrect}]`);

              // Debug: log if correctAnswer is null/undefined
              if (!correctAnswer && correctAnswers_arr.length === 0) {
                console.warn(`⚠️  Question ${question.id} has no correctAnswer!`);
              }

              // Handle both single-answer and multiple-answer questions
              let isCorrect = false;

              if (Array.isArray(userAnswer)) {
                // Multiple-answer question: user selected multiple options
                if (correctAnswers_arr.length > 0) {
                  // Compare arrays: user's answers must match all correct answers (regardless of order)
                  const userAnswersSorted = [...userAnswer].sort();
                  const correctAnswersSorted = [...correctAnswers_arr].map(a => a.trim()).sort();
                  isCorrect = JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswersSorted);
                  console.log(`    Multi-answer comparison: user=${JSON.stringify(userAnswersSorted)} vs correct=${JSON.stringify(correctAnswersSorted)} => ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
                }
              } else {
                // Single-answer question: user selected one option
                if (userAnswer && correctAnswer) {
                  isCorrect = userAnswer.trim() === correctAnswer.trim();
                  console.log(`    Single-answer comparison: "${userAnswer.trim()}" vs "${correctAnswer.trim()}" => ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
                }
              }

              if (isCorrect) {
                correctAnswers += questionMarks;
                evaluatedCount++;
                console.log(`    ✅ CORRECT - Added ${questionMarks} marks`);
              } else {
                console.log(`    ❌ INCORRECT`);
              }
            }

            // Calculate percentage score
            if (totalMarks > 0) {
              score = Math.round((correctAnswers / totalMarks) * 100);
              console.log(`✅ Score calculated: ${correctAnswers}/${totalMarks} = ${score}%`);
            } else {
              console.warn('⚠️ Total marks is 0');
              score = 0;
            }
          } else if (exam.examType === 'PROGRAMMING') {
            // For programming exams, score is set during evaluation
            score = submission.score || 0;
            console.log(`⚙️ Programming exam score (from evaluation): ${score}`);
          }

          const result = {
            id: exam.id,
            name: exam.name,
            subject: exam.subject,
            examType: exam.examType,
            score: score,
            totalMarks: exam.totalMarks,
            passingScore: exam.passingScore,
            durationMinutes: exam.durationMinutes,
            completedAt: submission.submittedAt,
            isSubmitted: true,
            submissionId: submission.id,
            status: score >= exam.passingScore ? 'PASSED' : 'FAILED',
          };

          console.log(`📦 Returning result:`, result);
          return result;
        })
      );

      console.log('✅ Returning', enrichedSubmissions.length, 'enriched submissions');
      return enrichedSubmissions;
    } catch (error) {
      console.error('❌ Error in getCandidateSubmissions:', error);
      throw error;
    }
  }

  /**
   * Get submission details with answers for a specific exam
   */
  async getSubmissionDetails(examId: string, candidateId: string): Promise<any> {
    try {
      console.log('🔍 Getting submission details for exam:', examId, 'candidate:', candidateId);

      // Find the submission
      const submission = await this.examSubmissionRepository.findOne({
        where: {
          examId: examId,
          candidateId: candidateId,
        },
      });

      if (!submission) {
        console.warn('⚠️ No submission found');
        return { answers: {} };
      }

      console.log('📋 Submission found:', {
        id: submission.id,
        answersType: typeof submission.answers,
        answersValue: submission.answers,
      });

      // Parse answers
      let answers: Record<string, string | null> = {};
      if (typeof submission.answers === 'string') {
        try {
          answers = JSON.parse(submission.answers);
          console.log('✅ Parsed answers from string:', answers);
        } catch (e) {
          console.warn('Could not parse answers:', e);
          answers = {};
        }
      } else if (typeof submission.answers === 'object' && submission.answers !== null) {
        answers = submission.answers as Record<string, string | null>;
        console.log('✅ Answers already as object:', answers);
      } else {
        console.warn('⚠️ Answers type unexpected:', typeof submission.answers);
        answers = {};
      }

      console.log('✅ Final answers to return:', answers);
      return { answers, submissionId: submission.id };
    } catch (error) {
      console.error('❌ Error in getSubmissionDetails:', error);
      throw error;
    }
  }

  /**
   * Get exam with correct answers for result review (for candidates viewing their own results)
   */
  async getExamResultsView(examId: string, candidateId: string): Promise<Exam> {
    console.log('📊 Getting exam results view for exam:', examId, 'candidate:', candidateId);

    // First verify that this submission belongs to the candidate
    const submission = await this.examSubmissionRepository.findOne({
      where: {
        examId: examId,
        candidateId: candidateId,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Get the exam with full details including correct answers
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: ['questions', 'programmingQuestions'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    // For result review, we include correct answers since they're reviewing their own submission
    console.log('✅ Returning exam with correct answers for results review');
    return exam;
  }

  async getExamById(id: string, userRole?: string): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: ['questions', 'programmingQuestions'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    // Ensure all questions have the allowMultipleCorrect field set
    if (exam.questions) {
      exam.questions = exam.questions.map(q => ({
        ...q,
        allowMultipleCorrect: q.allowMultipleCorrect ?? false,
        correctAnswers: q.correctAnswers ?? [],
      }));
    }

    // If user is a candidate (role is not admin/superadmin), filter out sensitive data
    if (userRole && !['ADMIN', 'SUPER_ADMIN', 'EVALUATOR', 'TEACHER', 'EXAM_CONTROLLER'].includes(userRole)) {
      // For candidates, hide correct answers
      if (exam.questions) {
        exam.questions = exam.questions.map(q => ({
          ...q,
          correctAnswer: undefined,
          correctAnswerExplanation: undefined,
        } as any));
      }
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

    // Auto-set allowMultipleCorrect based on correctAnswers array
    let questionData = { ...createQuestionDto };
    
    console.log('📥 Received DTO:', {
      questionText: questionData.questionText?.substring(0, 50),
      correctAnswer: questionData.correctAnswer,
      correctAnswers: questionData.correctAnswers,
      allowMultipleCorrect: questionData.allowMultipleCorrect,
    });
    
    // Ensure correctAnswers is always an array
    if (!Array.isArray(questionData.correctAnswers)) {
      questionData.correctAnswers = [];
    }
    
    // If we only have single answer, ensure correctAnswers array has it
    if (questionData.correctAnswer && questionData.correctAnswers.length === 0) {
      questionData.correctAnswers = [questionData.correctAnswer];
    }
    
    // Auto-set allowMultipleCorrect based on array length
    if (questionData.correctAnswers.length > 1) {
      questionData.allowMultipleCorrect = true;
    } else {
      questionData.allowMultipleCorrect = false;
    }

    console.log('📝 Processed question data:', {
      questionText: questionData.questionText?.substring(0, 50),
      allowMultipleCorrect: questionData.allowMultipleCorrect,
      correctAnswers: questionData.correctAnswers,
      correctAnswer: questionData.correctAnswer,
    });

    const question = this.questionRepository.create({
      ...questionData,
      exam,
      displayOrder: exam.questions.length,
    });
    
    console.log('💾 Question entity created:', {
      allowMultipleCorrect: question.allowMultipleCorrect,
      correctAnswers: question.correctAnswers,
      correctAnswer: question.correctAnswer,
    });

    const savedQuestion = await this.questionRepository.save(question);

    console.log('✅ Question saved to database:', {
      id: savedQuestion.id,
      allowMultipleCorrect: savedQuestion.allowMultipleCorrect,
      correctAnswers: savedQuestion.correctAnswers,
      correctAnswer: savedQuestion.correctAnswer,
    });

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

    // Auto-set allowMultipleCorrect based on correctAnswers array
    if (!Array.isArray(updateData.correctAnswers)) {
      updateData.correctAnswers = [];
    }
    
    if (updateData.correctAnswers.length > 1) {
      updateData.allowMultipleCorrect = true;
    } else if (updateData.correctAnswers !== undefined) {
      updateData.allowMultipleCorrect = false;
    }

    console.log('📝 Updating question:', {
      questionText: updateData.questionText?.substring(0, 50),
      allowMultipleCorrect: updateData.allowMultipleCorrect,
      correctAnswers: updateData.correctAnswers,
      correctAnswer: updateData.correctAnswer,
    });

    Object.assign(question, updateData);
    const updated = await this.questionRepository.save(question);

    console.log('✅ Question updated in database:', {
      id: updated.id,
      allowMultipleCorrect: updated.allowMultipleCorrect,
      correctAnswers: updated.correctAnswers,
      correctAnswer: updated.correctAnswer,
    });

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
   * Publish exam (change status from DRAFT to PUBLISHED) with optional filtering
   */
  async publishExam(id: string, userId: string, role?: string, publishDto?: any): Promise<Exam> {
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

    console.log('Publishing exam with DTO:', publishDto);
    console.log('Has filters:', publishDto && this.hasFilters(publishDto));

    // Count candidates that will receive the exam
    const candidateCount = await this.countCandidatesForExam(exam.organizationId, publishDto);

    // Create exam access records BEFORE marking exam as published
    // This ensures that if access record creation fails, the exam remains DRAFT
    try {
      if (publishDto && this.hasFilters(publishDto)) {
        console.log('Creating FILTERED exam access...');
        await this.createFilteredExamAccess(exam.id, exam.organizationId, publishDto);
      } else {
        console.log('Creating UNFILTERED exam access (all candidates)...');
        // If no filters, all candidates in the organization get access
        await this.createUnfilteredExamAccess(exam.id, exam.organizationId);
      }
    } catch (error) {
      // If access record creation fails, re-throw the error without marking exam as published
      throw new Error(`Failed to create exam access records: ${error.message}`);
    }

    // Only mark exam as published AFTER access records are successfully created
    exam.status = ExamStatus.PUBLISHED;
    exam.publishedCandidateCount = candidateCount;
    exam.publishedAt = new Date();
    const publishedExam = await this.examRepository.save(exam);

    console.log(`✅ Exam published with ${candidateCount} candidates assigned`);
    return publishedExam;
  }

  /**
   * Count candidates that will receive the exam based on filters
   */
  async countCandidatesForExam(
    organizationId: string,
    filters?: any,
  ): Promise<number> {
    console.log('🔢 Counting candidates for exam filters:', filters);

    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.role = :role', { role: 'CANDIDATE' });

    // Support both singular string filters and plural array filters
    // School(s)
    if (filters) {
      if (Array.isArray(filters.schools) && filters.schools.length > 0) {
        query = query.andWhere('profile.school IN (:...schools)', { schools: filters.schools });
      } else if (filters.school && typeof filters.school === 'string' && filters.school.trim()) {
        query = query.andWhere('profile.school = :school', { school: filters.school.trim() });
      }

      // Department(s)
      if (Array.isArray(filters.departments) && filters.departments.length > 0) {
        query = query.andWhere('profile.department IN (:...departments)', { departments: filters.departments });
      } else if (filters.department && typeof filters.department === 'string' && filters.department.trim()) {
        query = query.andWhere('profile.department = :department', { department: filters.department.trim() });
      }

      // Admission batch(es)
      if (Array.isArray(filters.admissionBatches) && filters.admissionBatches.length > 0) {
        query = query.andWhere('profile.admissionBatch IN (:...admissionBatches)', { admissionBatches: filters.admissionBatches });
      } else if (filters.admissionBatch && typeof filters.admissionBatch === 'string' && filters.admissionBatch.trim()) {
        query = query.andWhere('profile.admissionBatch = :admissionBatch', { admissionBatch: filters.admissionBatch.trim() });
      }

      // Current semester(s)
      if (Array.isArray(filters.currentSemesters) && filters.currentSemesters.length > 0) {
        query = query.andWhere('profile.currentSemester IN (:...currentSemesters)', { currentSemesters: filters.currentSemesters });
      } else if (filters.currentSemester && typeof filters.currentSemester === 'string' && filters.currentSemester.trim()) {
        query = query.andWhere('profile.currentSemester = :currentSemester', { currentSemester: filters.currentSemester.trim() });
      }
    }

    const count = await query.getCount();
    console.log(`✅ Found ${count} candidates matching filters`);
    return count;
  }

  /**
   * Check if any filter is provided (not empty strings)
   */
  private hasFilters(publishDto: any): boolean {
    if (!publishDto) return false;

    const hasArrayFilters = (
      (Array.isArray(publishDto.schools) && publishDto.schools.length > 0) ||
      (Array.isArray(publishDto.departments) && publishDto.departments.length > 0) ||
      (Array.isArray(publishDto.admissionBatches) && publishDto.admissionBatches.length > 0) ||
      (Array.isArray(publishDto.currentSemesters) && publishDto.currentSemesters.length > 0)
    );

    const hasStringFilters = (
      (publishDto.school && typeof publishDto.school === 'string' && publishDto.school.trim()) ||
      (publishDto.department && typeof publishDto.department === 'string' && publishDto.department.trim()) ||
      (publishDto.admissionBatch && typeof publishDto.admissionBatch === 'string' && publishDto.admissionBatch.trim()) ||
      (publishDto.currentSemester && typeof publishDto.currentSemester === 'string' && publishDto.currentSemester.trim())
    );

    const hasFilter = !!(hasArrayFilters || hasStringFilters);

    console.log('hasFilters() check:', {
      publishDto,
      hasArrayFilters,
      hasStringFilters,
      result: hasFilter,
    });

    return hasFilter;
  }

  /**
   * Create exam access records for filtered users
   */
  private async createFilteredExamAccess(
    examId: string,
    organizationId: string,
    filters: any,
  ): Promise<void> {
    console.log('=== CREATE FILTERED EXAM ACCESS START ===');
    console.log('Filter criteria received:', {
      schools: filters.schools || filters.school,
      departments: filters.departments || filters.department,
      admissionBatches: filters.admissionBatches || filters.admissionBatch,
      currentSemesters: filters.currentSemesters || filters.currentSemester,
    });

    // Build query to find matching users
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.role = :role', { role: 'CANDIDATE' });

    // Apply filters - support arrays (IN) or single values
    if (filters) {
      if (Array.isArray(filters.schools) && filters.schools.length > 0) {
        console.log(`Applying schools IN filter: ${JSON.stringify(filters.schools)}`);
        query = query.andWhere('profile.school IN (:...schools)', { schools: filters.schools });
      } else if (filters.school && typeof filters.school === 'string' && filters.school.trim()) {
        const schoolValue = filters.school.trim();
        console.log(`Applying school filter: "${schoolValue}"`);
        query = query.andWhere('profile.school = :school', { school: schoolValue });
      }

      if (Array.isArray(filters.departments) && filters.departments.length > 0) {
        console.log(`Applying departments IN filter: ${JSON.stringify(filters.departments)}`);
        query = query.andWhere('profile.department IN (:...departments)', { departments: filters.departments });
      } else if (filters.department && typeof filters.department === 'string' && filters.department.trim()) {
        const deptValue = filters.department.trim();
        console.log(`Applying department filter: "${deptValue}"`);
        query = query.andWhere('profile.department = :department', { department: deptValue });
      }

      if (Array.isArray(filters.admissionBatches) && filters.admissionBatches.length > 0) {
        console.log(`Applying admissionBatches IN filter: ${JSON.stringify(filters.admissionBatches)}`);
        query = query.andWhere('profile.admissionBatch IN (:...admissionBatches)', { admissionBatches: filters.admissionBatches });
      } else if (filters.admissionBatch && typeof filters.admissionBatch === 'string' && filters.admissionBatch.trim()) {
        const batchValue = filters.admissionBatch.trim();
        console.log(`Applying batch filter: "${batchValue}"`);
        query = query.andWhere('profile.admissionBatch = :admissionBatch', { admissionBatch: batchValue });
      }

      if (Array.isArray(filters.currentSemesters) && filters.currentSemesters.length > 0) {
        console.log(`Applying currentSemesters IN filter: ${JSON.stringify(filters.currentSemesters)}`);
        query = query.andWhere('profile.currentSemester IN (:...currentSemesters)', { currentSemesters: filters.currentSemesters });
      } else if (filters.currentSemester && typeof filters.currentSemester === 'string' && filters.currentSemester.trim()) {
        const semesterValue = filters.currentSemester.trim();
        console.log(`Applying semester filter: "${semesterValue}"`);
        query = query.andWhere('profile.currentSemester = :currentSemester', { currentSemester: semesterValue });
      }
    }

    const matchingUsers = await query.getMany();
    console.log(`Found ${matchingUsers.length} users matching filters`);
    if (matchingUsers.length > 0) {
      matchingUsers.forEach(u => {
        console.log(`  - User: ${u.email} (${u.id}) - School: ${u.profile?.school}, Dept: ${u.profile?.department}`);
      });
    } else {
      console.warn('⚠️ No matching users found! Check if filter values exist in the database.');
      // Show what values exist for debugging
      const allCandidates = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('user.organizationId = :organizationId', { organizationId })
        .andWhere('user.role = :role', { role: 'CANDIDATE' })
        .getMany();
      
      console.log('All candidates and their profiles:');
      allCandidates.forEach(u => {
        console.log(`  - ${u.email}: School=${u.profile?.school}, Dept=${u.profile?.department}, Batch=${u.profile?.admissionBatch}, Semester=${u.profile?.currentSemester}`);
      });
    }

    // Create ExamAccess records for matching users
    const examAccessRecords = matchingUsers.map((user) =>
      this.examAccessRepository.create({
        examId,
        userId: user.id,
        hasAccessToExam: true,
        filterCriteria: {
          school: Array.isArray(filters?.schools)
            ? filters.schools.join(',')
            : (filters?.school ? String(filters.school) : undefined),
          department: Array.isArray(filters?.departments)
            ? filters.departments.join(',')
            : (filters?.department ? String(filters.department) : undefined),
          admissionBatch: Array.isArray(filters?.admissionBatches)
            ? filters.admissionBatches.join(',')
            : (filters?.admissionBatch ? String(filters.admissionBatch) : undefined),
          currentSemester: Array.isArray(filters?.currentSemesters)
            ? filters.currentSemesters.join(',')
            : (filters?.currentSemester ? String(filters.currentSemester) : undefined),
        },
      }),
    );

    if (examAccessRecords.length > 0) {
      await this.examAccessRepository.save(examAccessRecords);
      console.log(`Successfully saved ${examAccessRecords.length} exam access records`);
    } else {
      console.log('ℹ️ No access records created (0 matching users)');
    }
    console.log('=== CREATE FILTERED EXAM ACCESS END ===');
  }

  /**
   * Create exam access records for all candidates in organization
   */
  private async createUnfilteredExamAccess(
    examId: string,
    organizationId: string,
  ): Promise<void> {
    // Get all candidate users in the organization
    const candidates = await this.userRepository
      .createQueryBuilder('user')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.role = :role', { role: 'CANDIDATE' })
      .getMany();

    // Create ExamAccess records for all candidates
    const examAccessRecords = candidates.map((user) =>
      this.examAccessRepository.create({
        examId,
        userId: user.id,
        hasAccessToExam: true,
        filterCriteria: {}, // No filters applied
      }),
    );

    if (examAccessRecords.length > 0) {
      await this.examAccessRepository.save(examAccessRecords);
    }
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

  /**
   * Unpublish exam (revert from PUBLISHED back to DRAFT and remove all access records)
   */
  async unpublishExam(id: string, userId: string, role?: string): Promise<Exam> {
    const exam = await this.getExamById(id);

    // Check authorization
    if (exam.createdBy !== userId && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new ForbiddenException('You can only unpublish your own exams');
    }

    // Can only unpublish PUBLISHED exams
    if (exam.status !== ExamStatus.PUBLISHED) {
      throw new BadRequestException('Only PUBLISHED exams can be unpublished');
    }

    // Delete all exam access records for this exam
    await this.examAccessRepository.delete({ examId: exam.id });

    // Revert exam status back to DRAFT
    exam.status = ExamStatus.DRAFT;
    return this.examRepository.save(exam);
  }

  /**
   * Upload evaluation mapping for exam
   * Expects JSON format: { "evaluator@email.com": ["candidate1@email.com", "candidate2@email.com"] }
   */
  async uploadEvaluationMapping(
    examId: string,
    mappings: Record<string, string[]>,
    organizationId: string,
  ): Promise<EvaluationMapping[]> {
    // Validate exam exists
    const exam = await this.examRepository.findOne({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Clear existing mappings for this exam
    await this.evaluationMappingRepository.delete({ examId });

    // Create new mappings
    const evaluationMappings: EvaluationMapping[] = [];
    for (const [evaluatorEmail, candidateEmails] of Object.entries(mappings)) {
      const mapping = this.evaluationMappingRepository.create({
        examId,
        organizationId,
        evaluatorEmail,
        candidateEmails: candidateEmails || [],
      });
      evaluationMappings.push(mapping);
    }

    return this.evaluationMappingRepository.save(evaluationMappings);
  }

  /**
   * Get evaluation mapping for a specific exam
   */
  async getEvaluationMapping(examId: string): Promise<EvaluationMapping[]> {
    return this.evaluationMappingRepository.find({
      where: { examId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find evaluator for a candidate based on mapping
   * Returns evaluator email and whether it was randomly selected
   */
  async findEvaluatorForCandidate(
    examId: string,
    candidateEmail: string,
    organizationId: string,
  ): Promise<{ evaluatorEmail: string | undefined; isRandomlyAssigned: boolean }> {
    // Check if candidate is mapped to an evaluator
    const mappings = await this.evaluationMappingRepository.find({
      where: { examId, organizationId },
    });

    // If no mappings exist, return undefined - submission will be pending manual assignment
    if (mappings.length === 0) {
      return {
        evaluatorEmail: undefined,
        isRandomlyAssigned: false,
      };
    }

    // Check if candidate is mapped
    for (const mapping of mappings) {
      if (mapping.candidateEmails.includes(candidateEmail)) {
        return {
          evaluatorEmail: mapping.evaluatorEmail,
          isRandomlyAssigned: false,
        };
      }
    }

    // If not mapped, randomly select an evaluator from available evaluators
    const randomIndex = Math.floor(Math.random() * mappings.length);
    return {
      evaluatorEmail: mappings[randomIndex].evaluatorEmail,
      isRandomlyAssigned: true,
    };
  }

  /**
   * Submit exam with answers
   */
  async submitExam(
    examId: string,
    candidateId: string,
    candidateEmail: string,
    answers: Record<string, string | string[] | null>,
    organizationId: string,
  ): Promise<ExamSubmission> {
    try {
      // Convert answers from array format to object if needed
      let answersObj: Record<string, string | string[] | null> = answers || {};
      
      if (Array.isArray(answers)) {
        console.warn('⚠️ Answers received in ARRAY format, converting to OBJECT format');
        answersObj = Object.fromEntries(
          (answers as any[]).map((a: any) => [a.questionId, a.answer])
        );
        console.log('✅ Converted answers:', answersObj);
      }

      console.log('🔍 Starting exam submission process:', {
        examId,
        candidateId,
        candidateEmail,
        organizationId,
        answerCount: Object.keys(answersObj).length,
        answersReceived: answersObj,
      });

      // Find existing submission (should have been created by startExam)
      let submission = await this.examSubmissionRepository.findOne({
        where: {
          examId,
          candidateId,
        },
      });

      // If submission exists, update it; otherwise create new one (for backward compatibility)
      if (submission) {
        console.log('✅ Found existing submission, updating with answers:', submission.id);
        console.log('📝 Storing answers:', answersObj);
        submission.answers = answersObj as Record<string, string | string[] | null>;
        submission.isLive = false; // Mark as no longer live
      } else {
        console.log('⚠️ No existing submission found, creating new one');

        // Validate exam exists and is published
        const exam = await this.examRepository.findOne({ where: { id: examId } });
        if (!exam) {
          console.error('❌ Exam not found:', examId);
          throw new NotFoundException('Exam not found');
        }

        if (exam.status !== ExamStatus.PUBLISHED) {
          console.error('❌ Exam not published:', exam.status);
          throw new BadRequestException('Exam is not available for submission');
        }

        // Find evaluator for this candidate
        const { evaluatorEmail, isRandomlyAssigned } = await this.findEvaluatorForCandidate(
          examId,
          candidateEmail,
          organizationId,
        );

        submission = this.examSubmissionRepository.create({
          examId,
          candidateId,
          answers: answersObj as Record<string, string | string[] | null>,
          evaluatorEmail: evaluatorEmail || undefined,
          isRandomlyAssigned,
          totalMarks: (await this.examRepository.findOne({ where: { id: examId } }))?.totalMarks as any,
          evaluationStatus: 'pending',
          isLive: false,
        });
      }

      const savedSubmission = await this.examSubmissionRepository.save(submission);
      
      console.log('✅ Exam submission saved successfully:', {
        submissionId: savedSubmission.id,
        isLive: savedSubmission.isLive,
        answersStored: savedSubmission.answers,
        answerCount: Object.keys(savedSubmission.answers || {}).length,
      });

      return savedSubmission;
    } catch (error) {
      console.error('❌ Error submitting exam:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get live ongoing exam submissions for real-time proctoring
   */
  async getLiveSubmissions(organizationId: string): Promise<any[]> {
    const now = new Date();
    
    // Get all submissions that are currently live (exam is being taken, not submitted/completed)
    const liveSubmissions = await this.examSubmissionRepository.find({
      where: {
        isLive: true,
        evaluationStatus: 'pending', // Only show submissions that are actively being taken, not completed
      },
      relations: ['exam', 'candidate'],
      order: { submittedAt: 'DESC' },
    });

    console.log('📊 [LiveProctoring] Raw live submissions found:', liveSubmissions.length);
    if (liveSubmissions.length > 0) {
      console.log('📋 [LiveProctoring] Submission IDs:', liveSubmissions.map(s => ({ id: s.id, orgId: s.exam?.organizationId, requestedOrgId: organizationId, submittedAt: s.submittedAt, duration: s.exam?.durationMinutes, hasAnswers: s.answers && Object.keys(s.answers).length > 0 })));
    }

    // Filter by organization AND by time window (exam must still be within duration)
    const filteredSubmissions = liveSubmissions.filter((submission: any) => {
      if (!submission.exam || submission.exam.organizationId !== organizationId) {
        console.log('❌ [LiveProctoring] Filtered OUT - Organization mismatch:', { submissionId: submission.id, submittedOrgId: submission.exam?.organizationId, requestedOrgId: organizationId });
        return false;
      }

      // SAFETY CHECK 1: Verify isLive is still true (double-check in case DB state changed)
      if (!submission.isLive) {
        console.log('❌ [LiveProctoring] Filtered OUT - isLive flag is false:', { submissionId: submission.id });
        return false;
      }

      // SAFETY CHECK 2: If answers have been submitted (if answers exist and not empty, exam is submitted)
      const hasAnswers = submission.answers && Object.keys(submission.answers).length > 0;
      if (hasAnswers) {
        console.log('❌ [LiveProctoring] Filtered OUT - Exam submitted (has answers):', { submissionId: submission.id, answerCount: Object.keys(submission.answers).length });
        return false;
      }

      // Check if exam is still within time limit
      const startTime = new Date(submission.submittedAt).getTime();
      const durationMs = (submission.exam.durationMinutes || 60) * 60 * 1000;
      const endTime = startTime + durationMs;
      const currentTime = now.getTime();
      const elapsedMs = currentTime - startTime;

      // Only include if current time is before exam end time
      if (currentTime > endTime) {
        console.log('⏰ [LiveProctoring] Filtered OUT - Exam time exceeded:', {
          submissionId: submission.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          currentTime: new Date(currentTime).toISOString(),
          elapsedMinutes: Math.floor(elapsedMs / 60000),
          durationMinutes: submission.exam.durationMinutes,
          exceededByMinutes: Math.floor((elapsedMs - durationMs) / 60000),
        });
        return false;
      }

      console.log('✅ [LiveProctoring] KEEPING - Exam in progress (no answers yet, within time):', {
        submissionId: submission.id,
        elapsedMinutes: Math.floor(elapsedMs / 60000),
        durationMinutes: submission.exam.durationMinutes,
      });
      return true;
    });

    console.log('📊 [LiveProctoring] Final filtered submissions count:', filteredSubmissions.length);

    // Async cleanup: Mark submissions with answers as not live (background task)
    liveSubmissions.forEach((submission: any) => {
      const hasAnswers = submission.answers && Object.keys(submission.answers).length > 0;
      if (hasAnswers && submission.isLive) {
        console.log('🔧 [LiveProctoring] Auto-cleanup: Marking submission as not live:', { submissionId: submission.id });
        submission.isLive = false;
        this.examSubmissionRepository.save(submission).catch(err => {
          console.error('❌ [LiveProctoring] Failed to auto-cleanup:', { submissionId: submission.id, error: err.message });
        });
      }
    });

    // Map to response format with details
    return filteredSubmissions.map((submission: any) => ({
      id: submission.id,
      userId: submission.candidateId,
      user: {
        id: submission.candidate?.id,
        name: submission.candidate?.name,
        email: submission.candidate?.email,
      },
      examId: submission.examId,
      exam: {
        id: submission.exam?.id,
        name: submission.exam?.name,
        examType: submission.exam?.examType,
        durationMinutes: submission.exam?.durationMinutes,
      },
      status: submission.evaluationStatus,
      startTime: submission.submittedAt,
      score: submission.score,
    }));
  }

  /**
   * Start exam - create submission record with isLive: true
   */
  async startExam(
    examId: string,
    candidateId: string,
    candidateEmail: string,
    organizationId: string,
  ): Promise<ExamSubmission> {
    try {
      console.log('🔍 Starting exam:', { examId, candidateId, candidateEmail });

      // Check if exam exists and is published
      const exam = await this.examRepository.findOne({ where: { id: examId } });
      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      if (exam.status !== ExamStatus.PUBLISHED) {
        throw new BadRequestException('Exam is not available');
      }

      // Check if candidate has already submitted this exam
      const existingSubmission = await this.examSubmissionRepository.findOne({
        where: {
          examId,
          candidateId,
        },
      });

      if (existingSubmission) {
        throw new BadRequestException('You have already submitted this exam. Retaking is not allowed.');
      }

      // Find evaluator for this candidate when exam starts
      const { evaluatorEmail, isRandomlyAssigned } = await this.findEvaluatorForCandidate(
        examId,
        candidateEmail,
        organizationId,
      );

      // Create initial submission record with isLive: true
      const submission = this.examSubmissionRepository.create({
        examId,
        candidateId,
        answers: {}, // Empty initially, will be updated as candidate answers
        evaluationStatus: 'pending',
        isLive: true, // Set to true when exam starts
        totalMarks: exam.totalMarks as any,
        evaluatorEmail: evaluatorEmail || undefined,
        isRandomlyAssigned,
      });

      const savedSubmission = await this.examSubmissionRepository.save(submission);
      console.log('✅ Exam started:', { 
        submissionId: savedSubmission.id, 
        isLive: true,
        evaluatorEmail: savedSubmission.evaluatorEmail,
      });

      return savedSubmission;
    } catch (error) {
      console.error('❌ Error starting exam:', error);
      throw error;
    }
  }

  /**
   * Get submissions for an evaluator
   */
  async getSubmissionsForEvaluator(evaluatorEmail: string): Promise<ExamSubmission[]> {
    return this.examSubmissionRepository.find({
      where: { evaluatorEmail },
      relations: ['exam', 'candidate'],
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Get all submissions for an exam
   */
  async getSubmissionsForExam(examId: string): Promise<ExamSubmission[]> {
    // Get exam with all its questions
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: [
        'questions',
        'programmingQuestions',
      ],
      select: {
        id: true,
        name: true,
        examType: true,
        totalMarks: true,
        durationMinutes: true,
        status: true,
        questions: {
          id: true,
          questionText: true,
          marks: true,
          correctAnswer: true,
          correctAnswers: true,
          allowMultipleCorrect: true,
        },
        programmingQuestions: {
          id: true,
          problemStatement: true,
          maxMarks: true,
        },
      },
    });

    // Get all submissions for this exam
    const submissions = await this.examSubmissionRepository.find({
      where: { examId },
      relations: ['candidate'],
      order: { submittedAt: 'DESC' },
    });

    // Calculate scores for each submission if exam is MCQ type
    if (exam && exam.examType === 'MCQ' && exam.questions) {
      const enrichedSubmissions = submissions.map((submission) => {
        let score = 0;
        let answers: Record<string, string | string[] | null> = {};

        // Parse answers
        if (typeof submission.answers === 'string') {
          try {
            answers = JSON.parse(submission.answers);
          } catch (e) {
            console.warn('Could not parse answers for submission:', submission.id);
            answers = {};
          }
        } else if (typeof submission.answers === 'object' && submission.answers !== null) {
          answers = submission.answers as Record<string, string | string[] | null>;
        }

        // Calculate score by comparing answers with correct answers
        let correctAnswersCount = 0;
        let totalMarks = 0;

        for (const question of exam.questions) {
          const questionMarks = Number(question.marks) || 1;
          totalMarks += questionMarks;

          const userAnswer = answers[question.id];
          const correctAnswer = question.correctAnswer;
          const correctAnswers_arr = question.correctAnswers || [];

          let isCorrect = false;

          if (Array.isArray(userAnswer)) {
            // Multiple-answer question
            if (correctAnswers_arr.length > 0) {
              const userAnswersSorted = [...userAnswer].sort();
              const correctAnswersSorted = [...correctAnswers_arr].map(a => a.trim()).sort();
              isCorrect = JSON.stringify(userAnswersSorted) === JSON.stringify(correctAnswersSorted);
            }
          } else {
            // Single-answer question
            if (userAnswer && correctAnswer) {
              isCorrect = userAnswer.trim() === correctAnswer.trim();
            }
          }

          if (isCorrect) {
            correctAnswersCount += questionMarks;
          }
        }

        // Calculate percentage score
        const percentageScore = totalMarks > 0 ? Math.round((correctAnswersCount / totalMarks) * 100) : 0;
        submission.score = percentageScore;

        return submission;
      });

      return enrichedSubmissions;
    }

    return submissions;
  }

  /**
   * Update submission evaluation
   */
  async updateSubmissionEvaluation(
    submissionId: string,
    evaluatorId: string,
    score: number,
    comments: string,
  ): Promise<ExamSubmission> {
    const submission = await this.examSubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.evaluatedBy = evaluatorId;
    submission.score = score;
    submission.evaluationComments = comments;
    submission.evaluationStatus = 'completed';

    return this.examSubmissionRepository.save(submission);
  }

  /**
   * Update screen capture for live proctoring
   */
  async updateScreenCapture(submissionId: string, screenshot: string, userId: string): Promise<{ success: boolean }> {
    const submission = await this.examSubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Verify the user is the candidate taking the exam
    if (submission.candidateId !== userId) {
      throw new BadRequestException('Unauthorized to update this submission');
    }

    // Store the screenshot (limit to last 500KB to prevent storage bloat)
    const maxSize = 500000; // 500KB
    const trimmedScreenshot = screenshot.length > maxSize ? screenshot.substring(0, maxSize) : screenshot;

    submission.screenCapture = trimmedScreenshot;
    await this.examSubmissionRepository.save(submission);

    return { success: true };
  }

  /**
   * Get latest screen capture for submission
   */
  async getScreenCapture(submissionId: string): Promise<{ screenshot: string | null; timestamp: Date; hasCaptured: boolean }> {
    const submission = await this.examSubmissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Log screen capture retrieval for auditing
    if (submission.screenCapture) {
      console.log('📸 [ScreenCapture] Returning screenshot for submission:', { 
        submissionId, 
        screenshotSize: submission.screenCapture.length,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⏳ [ScreenCapture] No screenshot yet for submission:', submissionId);
    }

    return {
      screenshot: submission.screenCapture || null,
      timestamp: new Date(),
      hasCaptured: !!submission.screenCapture,
    };
  }}