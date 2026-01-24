import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateProgrammingQuestionDto } from './dto/create-programming-question.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  /**
   * Create a new exam
   * POST /exams
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createExam(@Body() createExamDto: CreateExamDto, @Request() req) {
    return this.examService.createExam(createExamDto, req.user.id, req.user.organizationId);
  }

  /**
   * Get all exams for current user
   * GET /exams
   */
  @Get()
  async getExams(@Request() req) {
    return this.examService.getExams(req.user.id, req.user.role, req.user.organizationId);
  }

  /**
   * Get a single exam by ID
   * GET /exams/:id
   */
  @Get(':id')
  async getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  /**
   * Update exam (basic info and settings)
   * PATCH /exams/:id
   */
  @Patch(':id')
  async updateExam(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
    @Request() req,
  ) {
    return this.examService.updateExam(id, updateExamDto, req.user.id, req.user.role);
  }

  /**
   * Delete exam (only DRAFT exams)
   * DELETE /exams/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExam(@Param('id') id: string, @Request() req) {
    return this.examService.deleteExam(id, req.user.id, req.user.role);
  }

  /**
   * Publish exam (change DRAFT to PUBLISHED)
   * PATCH /exams/:id/publish
   */
  @Patch(':id/publish')
  async publishExam(@Param('id') id: string, @Request() req) {
    return this.examService.publishExam(id, req.user.id, req.user.role);
  }

  /**
   * Archive exam
   * PATCH /exams/:id/archive
   */
  @Patch(':id/archive')
  async archiveExam(@Param('id') id: string, @Request() req) {
    return this.examService.archiveExam(id, req.user.id, req.user.role);
  }

  /**
   * Close exam
   * PATCH /exams/:id/close
   */
  @Patch(':id/close')
  async closeExam(@Param('id') id: string, @Request() req) {
    return this.examService.closeExam(id, req.user.id, req.user.role);
  }

  /**
   * Duplicate exam (creates a new DRAFT copy)
   * POST /exams/:id/duplicate
   */
  @Post(':id/duplicate')
  async duplicateExam(@Param('id') id: string, @Request() req) {
    return this.examService.duplicateExam(id, req.user.id);
  }

  // ============= QUESTIONS ENDPOINTS =============

  /**
   * Add MCQ question to exam
   * POST /exams/:id/questions
   */
  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  async addQuestion(
    @Param('id') examId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.examService.addQuestion(examId, createQuestionDto);
  }

  /**
   * Update MCQ question
   * PATCH /exams/:examId/questions/:questionId
   */
  @Patch(':examId/questions/:questionId')
  async updateQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Body() updateData: Partial<CreateQuestionDto>,
  ) {
    return this.examService.updateQuestion(examId, questionId, updateData);
  }

  /**
   * Delete MCQ question
   * DELETE /exams/:examId/questions/:questionId
   */
  @Delete(':examId/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examService.deleteQuestion(examId, questionId);
  }

  // ============= PROGRAMMING QUESTIONS ENDPOINTS =============

  /**
   * Add programming question to exam
   * POST /exams/:id/programming-questions
   */
  @Post(':id/programming-questions')
  @HttpCode(HttpStatus.CREATED)
  async addProgrammingQuestion(
    @Param('id') examId: string,
    @Body() createProgrammingQuestionDto: CreateProgrammingQuestionDto,
  ) {
    return this.examService.addProgrammingQuestion(
      examId,
      createProgrammingQuestionDto,
    );
  }

  /**
   * Update programming question
   * PATCH /exams/:examId/programming-questions/:questionId
   */
  @Patch(':examId/programming-questions/:questionId')
  async updateProgrammingQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Body() updateData: Partial<CreateProgrammingQuestionDto>,
  ) {
    return this.examService.updateProgrammingQuestion(
      examId,
      questionId,
      updateData,
    );
  }

  /**
   * Delete programming question
   * DELETE /exams/:examId/programming-questions/:questionId
   */
  @Delete(':examId/programming-questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProgrammingQuestion(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examService.deleteProgrammingQuestion(examId, questionId);
  }
}
