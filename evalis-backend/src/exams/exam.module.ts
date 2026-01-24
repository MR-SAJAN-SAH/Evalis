import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { ProgrammingQuestion } from './entities/programming-question.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, ProgrammingQuestion])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
