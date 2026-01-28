import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AIService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('generate-questions')
  async generateQuestions(
    @Body()
    body: {
      prompt: string;
      numberOfQuestions: number;
      marksPerQuestion: number;
    },
  ) {
    const questions = await this.aiService.generateQuestionWithFallback({
      prompt: body.prompt,
      numberOfQuestions: body.numberOfQuestions,
      marksPerQuestion: body.marksPerQuestion,
    });

    return {
      success: true,
      questions,
      count: questions.length,
    };
  }
}
