import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Req,
  BadRequestException,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PapersService } from './papers.service';
import type { Express } from 'express';

@Controller('papers')
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaper(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { batch, school, department, semester, examType, candidateType } = body;

    const paper = await this.papersService.uploadPaper(
      file,
      batch,
      school,
      department,
      semester,
      examType,
      candidateType,
      req.user.organizationId,
    );

    // Return paper without fileData
    const { fileData, ...paperWithoutFile } = paper;
    return {
      success: true,
      message: 'Paper uploaded successfully',
      data: paperWithoutFile,
    };
  }

  @Get('evaluator/my-assignments')
  @UseGuards(JwtAuthGuard)
  async getMyAssignedPapers(@Req() req: any) {
    const papers = await this.papersService.getPapersAssignedToEvaluator(
      req.user.email,
      req.user.organizationId,
    );

    return {
      success: true,
      data: papers,
      count: papers.length,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPapers(@Req() req: any) {
    const papers = await this.papersService.getPapersByOrganization(req.user.organizationId);

    return {
      success: true,
      data: papers,
      count: papers.length,
    };
  }

  @Get('batch/:batch')
  @UseGuards(JwtAuthGuard)
  async getPapersByBatch(@Param('batch') batch: string, @Req() req: any) {
    const papers = await this.papersService.getPapersByBatch(req.user.organizationId, batch);

    return {
      success: true,
      data: papers,
      count: papers.length,
    };
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  async getPapersByStatus(@Param('status') status: string, @Req() req: any) {
    const papers = await this.papersService.getPapersByStatus(req.user.organizationId, status);

    return {
      success: true,
      data: papers,
      count: papers.length,
    };
  }

  @Get(':paperid/details')
  @UseGuards(JwtAuthGuard)
  async getPaper(@Param('paperid') paperid: string, @Req() req: any) {
    const paper = await this.papersService.getPaperById(paperid, false);

    if (paper.organizationId !== req.user.organizationId) {
      throw new BadRequestException('Unauthorized to access this paper');
    }

    return {
      success: true,
      data: paper,
    };
  }

  @Get(':paperid/download')
  @UseGuards(JwtAuthGuard)
  async downloadPaper(
    @Param('paperid') paperid: string,
    @Req() req: any,
    @Response() res: any,
  ) {
    try {
      const { fileData, fileName } = await this.papersService.getPaperFileData(
        paperid,
        req.user.organizationId,
      );

      // Set response headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileData.length,
      });

      // Send file data
      res.send(fileData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':paperid/status')
  @UseGuards(JwtAuthGuard)
  async updatePaperStatus(
    @Param('paperid') paperid: string,
    @Body() body: { status: string; assignedTo?: string; marks?: number },
    @Req() req: any,
  ) {
    const paper = await this.papersService.getPaperById(paperid);

    if (paper.organizationId !== req.user.organizationId) {
      throw new BadRequestException('Unauthorized to update this paper');
    }

    const updated = await this.papersService.updatePaperStatus(
      paperid,
      body.status,
      body.assignedTo,
      body.marks,
    );

    const { fileData, ...paperWithoutFile } = updated;
    return {
      success: true,
      message: 'Paper status updated successfully',
      data: paperWithoutFile,
    };
  }

  @Patch(':paperid/notes')
  @UseGuards(JwtAuthGuard)
  async updatePaperNotes(
    @Param('paperid') paperid: string,
    @Body() body: { notes: string },
    @Req() req: any,
  ) {
    const paper = await this.papersService.getPaperById(paperid);

    if (paper.organizationId !== req.user.organizationId) {
      throw new BadRequestException('Unauthorized to update this paper');
    }

    const updated = await this.papersService.updatePaperNotes(paperid, body.notes);

    const { fileData, ...paperWithoutFile } = updated;
    return {
      success: true,
      message: 'Paper notes updated successfully',
      data: paperWithoutFile,
    };
  }

  @Delete(':paperid')
  @UseGuards(JwtAuthGuard)
  async deletePaper(@Param('paperid') paperid: string, @Req() req: any) {
    await this.papersService.deletePaper(paperid, req.user.organizationId);

    return {
      success: true,
      message: 'Paper deleted successfully',
    };
  }

  @Post(':paperid/send-to-evaluator')
  @UseGuards(JwtAuthGuard)
  async sendPaperToEvaluator(
    @Param('paperid') paperid: string,
    @Body() body: { evaluatorEmail: string },
    @Req() req: any,
  ) {
    if (!body.evaluatorEmail) {
      throw new BadRequestException('Evaluator email is required');
    }

    const paper = await this.papersService.getPaperById(paperid);
    if (paper.organizationId !== req.user.organizationId) {
      throw new BadRequestException('Unauthorized to send this paper');
    }

    const updated = await this.papersService.sendPaperToEvaluator(
      paperid,
      body.evaluatorEmail,
      req.user.organizationId,
    );

    const { fileData, ...paperWithoutFile } = updated;
    return {
      success: true,
      message: `Paper sent to evaluator ${body.evaluatorEmail}`,
      data: paperWithoutFile,
    };
  }

  @Post(':paperid/check-evaluator')
  @UseGuards(JwtAuthGuard)
  async checkEvaluatorExists(
    @Param('paperid') paperid: string,
    @Body() body: { evaluatorEmail: string },
    @Req() req: any,
  ) {
    if (!body.evaluatorEmail) {
      throw new BadRequestException('Evaluator email is required');
    }

    const paper = await this.papersService.getPaperById(paperid);
    if (paper.organizationId !== req.user.organizationId) {
      throw new BadRequestException('Unauthorized');
    }

    const evaluator = await this.papersService.checkEvaluatorExists(
      body.evaluatorEmail,
      req.user.organizationId,
    );

    return {
      success: true,
      exists: !!evaluator,
      message: evaluator
        ? `Evaluator ${body.evaluatorEmail} found`
        : `Evaluator ${body.evaluatorEmail} not found in organization`,
    };
  }
}
