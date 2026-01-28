import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { ProgrammingQuestion } from './entities/programming-question.entity';
import { ExamAccess } from './entities/exam-access.entity';
import { EvaluationMapping } from './entities/evaluation-mapping.entity';
import { ExamSubmission } from './entities/exam-submission.entity';
import { ExamService } from './exam.service';
import { ExamAnalyticsService } from './exam-analytics.service';
import { ExamController } from './exam.controller';
import { ScreenStreamingGateway } from './screen-streaming.gateway';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, ProgrammingQuestion, ExamAccess, EvaluationMapping, ExamSubmission, User])],
  controllers: [ExamController],
  providers: [ExamService, ExamAnalyticsService, ScreenStreamingGateway],
  exports: [ExamService, ExamAnalyticsService, ScreenStreamingGateway],
})
export class ExamModule {}
