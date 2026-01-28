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
  ConflictException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExamService } from './exam.service';
import { ExamAnalyticsService } from './exam-analytics.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateProgrammingQuestionDto } from './dto/create-programming-question.dto';
import { PublishExamDto } from './dto/publish-exam.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(
    private readonly examService: ExamService,
    private readonly examAnalyticsService: ExamAnalyticsService,
  ) {}

  /**
   * Create a new exam
   * POST /exams
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createExam(@Body() createExamDto: CreateExamDto, @Request() req) {
    console.log('📝 [ExamController] POST /exams - Create exam request', {
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      organizationId: req.user?.organizationId,
      examName: createExamDto.name,
      hasUser: !!req.user,
    });
    
    if (!req.user) {
      console.error('❌ [ExamController] User object not found in request');
      throw new Error('User not authenticated');
    }
    
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
   * Get published exams analytics for admin
   * GET /exams/published/analytics
   */
  @Get('published/analytics')
  async getPublishedExamsAnalytics(@Request() req) {
    console.log('📊 [CONTROLLER] GET /exams/published/analytics called for organization:', req.user.organizationId);
    const result = await this.examAnalyticsService.getPublishedExamsAnalytics(req.user.organizationId);
    console.log('📊 [CONTROLLER] Returning analytics:', result);
    return result;
  }

  /**
   * Get candidate's submitted exams with scores
   * GET /exams/candidate/submissions
   */
  @Get('candidate/submissions')
  async getCandidateSubmissions(@Request() req) {
    console.log('🔗 [CONTROLLER] GET /exams/candidate/submissions called for user:', req.user.id);
    const result = await this.examService.getCandidateSubmissions(req.user.id);
    console.log('🔗 [CONTROLLER] Returning result:', result);
    return result;
  }

  /**
   * Get submission details with answers for a specific exam
   * GET /exams/:examId/submission-details
   */
  @Get(':examId/submission-details')
  async getSubmissionDetails(
    @Param('examId') examId: string,
    @Request() req,
  ) {
    console.log('🔗 [CONTROLLER] GET /exams/:examId/submission-details called for exam:', examId, 'user:', req.user.id);
    const result = await this.examService.getSubmissionDetails(examId, req.user.id);
    console.log('🔗 [CONTROLLER] Returning submission details:', result);
    return result;
  }

  /**
   * Get exam with correct answers for result review
   * GET /exams/:examId/results-view
   */
  @Get(':examId/results-view')
  async getExamResultsView(
    @Param('examId') examId: string,
    @Request() req,
  ) {
    console.log('🔗 [CONTROLLER] GET /exams/:examId/results-view called for exam:', examId, 'user:', req.user.id);
    const result = await this.examService.getExamResultsView(examId, req.user.id);
    console.log('🔗 [CONTROLLER] Returning exam results view:', result);
    return result;
  }

  /**
   * Get a single exam by ID
   * GET /exams/:id
   */
  @Get(':id')
  async getExamById(@Param('id') id: string, @Request() req) {
    return this.examService.getExamById(id, req.user?.role);
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
   * Count candidates that will receive the exam based on filters
   * POST /exams/:id/count-candidates
   */
  @Post(':id/count-candidates')
  async countCandidatesForExam(
    @Param('id') id: string,
    @Body() publishDto: any,
    @Request() req,
  ) {
    console.log('📊 [CONTROLLER] POST /exams/:id/count-candidates called with filters:', publishDto);
    const count = await this.examService.countCandidatesForExam(req.user.organizationId, publishDto);
    console.log(`📊 [CONTROLLER] Returning candidate count: ${count}`);
    return { count };
  }

  /**
   * Publish exam (change DRAFT to PUBLISHED) with optional filters
   * PATCH /exams/:id/publish
   */
  @Patch(':id/publish')
  async publishExam(
    @Param('id') id: string,
    @Body() publishDto: any,
    @Request() req,
  ) {
    return this.examService.publishExam(id, req.user.id, req.user.role, publishDto);
  }

  /**
   * Unpublish exam (revert PUBLISHED back to DRAFT)
   * PATCH /exams/:id/unpublish
   */
  @Patch(':id/unpublish')
  async unpublishExam(@Param('id') id: string, @Request() req) {
    return this.examService.unpublishExam(id, req.user.id, req.user.role);
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

  /**
   * Upload evaluation mapping JSON file
   * POST /exams/:examId/evaluation-mapping/upload
   */
  @Post(':examId/evaluation-mapping/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvaluationMapping(
    @Param('examId') examId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const fileContent = file.buffer.toString('utf-8');
      const mappings = JSON.parse(fileContent);

      // Validate JSON format
      if (typeof mappings !== 'object' || Array.isArray(mappings)) {
        throw new BadRequestException('Invalid JSON format. Expected object with evaluator emails as keys and candidate email arrays as values.');
      }

      // Validate that all values are arrays
      for (const [evaluator, candidates] of Object.entries(mappings)) {
        if (!Array.isArray(candidates)) {
          throw new BadRequestException(`Invalid format for evaluator "${evaluator}". Expected array of candidate emails.`);
        }
      }

      return this.examService.uploadEvaluationMapping(examId, mappings, req.user.organizationId);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON file. Please check file format.');
      }
      throw error;
    }
  }

  /**
   * Get evaluation mapping for exam
   * GET /exams/:examId/evaluation-mapping
   */
  @Get(':examId/evaluation-mapping')
  async getEvaluationMapping(@Param('examId') examId: string) {
    return this.examService.getEvaluationMapping(examId);
  }

  /**
   * Start exam - initialize submission record with isLive: true
   * POST /exams/:examId/start
   */
  @Post(':examId/start')
  async startExam(
    @Param('examId') examId: string,
    @Request() req,
  ) {
    return this.examService.startExam(
      examId,
      req.user.id,
      req.user.email,
      req.user.organizationId,
    );
  }

  /**
   * Submit exam with answers
   * POST /exams/:examId/submit
   */
  @Post(':examId/submit')
  @HttpCode(HttpStatus.CREATED)
  async submitExam(
    @Param('examId') examId: string,
    @Body() body: { answers: Record<string, string | null> },
    @Request() req,
  ) {
    console.log('📥 Submit exam request:', {
      examId,
      userId: req.user?.id,
      userEmail: req.user?.email,
      organizationId: req.user?.organizationId,
      answersCount: Object.keys(body.answers || {}).length,
    });

    if (!req.user?.email) {
      throw new BadRequestException('User email not found in token. Please logout and login again.');
    }

    try {
      return await this.examService.submitExam(
        examId,
        req.user.id,
        req.user.email,
        body.answers,
        req.user.organizationId,
      );
    } catch (error: any) {
      // Return 409 Conflict if exam already submitted
      if (error.message && error.message.includes('already submitted')) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Upload screen capture for live proctoring
   * POST /exams/:submissionId/screen-capture
   */
  @Post(':submissionId/screen-capture')
  async uploadScreenCapture(
    @Param('submissionId') submissionId: string,
    @Body() body: { screenshot: string },
    @Request() req,
  ) {
    return this.examService.updateScreenCapture(submissionId, body.screenshot, req.user.id);
  }

  /**
   * Get latest screen capture for submission
   * GET /exams/:submissionId/screen-capture
   */
  @Get(':submissionId/screen-capture')
  async getScreenCapture(@Param('submissionId') submissionId: string) {
    return this.examService.getScreenCapture(submissionId);
  }

  /**
   * Get live ongoing exam submissions
   * GET /exams/submissions/live
   */
  @Get('submissions/live')
  async getLiveSubmissions(@Request() req) {
    return this.examService.getLiveSubmissions(req.user.organizationId);
  }

  /**
   * Get submissions for evaluator
   * GET /exams/submissions/evaluator
   */
  @Get('submissions/evaluator/:email')
  async getSubmissionsForEvaluator(@Param('email') evaluatorEmail: string) {
    return this.examService.getSubmissionsForEvaluator(evaluatorEmail);
  }

  /**
   * Get submissions for exam
   * GET /exams/:examId/submissions
   */
  @Get(':examId/submissions')
  async getSubmissionsForExam(@Param('examId') examId: string) {
    return this.examService.getSubmissionsForExam(examId);
  }

  /**
   * Update submission evaluation
   * PATCH /exams/submissions/:submissionId/evaluate
   */
  @Patch('submissions/:submissionId/evaluate')
  async updateSubmissionEvaluation(
    @Param('submissionId') submissionId: string,
    @Body() body: { score: number; comments: string },
    @Request() req,
  ) {
    return this.examService.updateSubmissionEvaluation(
      submissionId,
      req.user.id,
      body.score,
      body.comments,
    );
  }
}
