import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from './paper.entity';
import { User } from '../users/entities/user.entity';
import type { Express } from 'express';

@Injectable()
export class PapersService {
  constructor(
    @InjectRepository(Paper)
    private papersRepository: Repository<Paper>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  validatePdfFilename(filename: string): { roll: string; examname: string } {
    // Expected format: roll_examname.pdf (e.g., 22054081_DOS.pdf)
    const pdfPattern = /^(\d+)_(.+)\.pdf$/i;
    const match = filename.match(pdfPattern);

    if (!match) {
      throw new BadRequestException(
        `Invalid PDF filename format. Expected: roll_examname.pdf (e.g., 22054081_DOS.pdf). Got: ${filename}`,
      );
    }

    const roll = match[1];
    const examname = match[2];

    if (!roll || !examname) {
      throw new BadRequestException('Roll number and exam name cannot be empty');
    }

    return { roll, examname };
  }

  async uploadPaper(
    file: Express.Multer.File,
    batch: string,
    school: string,
    department: string,
    semester: string,
    examType: string,
    candidateType: string,
    organizationId: string,
  ): Promise<Paper> {
    try {
      // Validate all required fields
      if (!batch || !school || !department || !semester || !examType || !candidateType) {
        throw new BadRequestException('All exam details (batch, school, department, semester, exam type, candidate type) are required');
      }

      // Validate file
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!file.mimetype.includes('pdf')) {
        throw new BadRequestException('Only PDF files are allowed');
      }

      // Check file size (10MB limit)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      // Validate filename and extract roll and exam name
      const { roll, examname } = this.validatePdfFilename(file.originalname);

      // Create paper record in database with file data
      const paper = new Paper();
      paper.roll = roll;
      paper.examname = examname;
      paper.fileData = file.buffer;
      paper.fileSize = file.size;
      paper.fileName = file.originalname;
      paper.uploadedDate = new Date();
      paper.status = 'pending';
      paper.assignedTo = null;
      paper.marks = null;
      paper.batch = batch;
      paper.school = school;
      paper.department = department;
      paper.semester = semester;
      paper.examType = examType;
      paper.candidateType = candidateType;
      paper.organizationId = organizationId;
      paper.notes = null;

      return await this.papersRepository.save(paper);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload paper: ${error.message}`);
    }
  }

  async getPapersByOrganization(organizationId: string): Promise<any[]> {
    // Return papers without fileData (too large to send in list)
    const papers = await this.papersRepository.find({
      where: { organizationId },
      order: { uploadedDate: 'DESC' },
      select: [
        'paperid',
        'roll',
        'examname',
        'fileName',
        'fileSize',
        'uploadedDate',
        'status',
        'assignedTo',
        'marks',
        'batch',
        'school',
        'department',
        'semester',
        'examType',
        'candidateType',
        'notes',
      ],
    });

    return papers;
  }

  async getPaperById(paperid: string, includeFileData: boolean = false): Promise<Paper> {
    const query = this.papersRepository.createQueryBuilder('paper')
      .where('paper.paperid = :paperid', { paperid });

    if (!includeFileData) {
      query.select([
        'paper.paperid',
        'paper.roll',
        'paper.examname',
        'paper.fileName',
        'paper.fileSize',
        'paper.uploadedDate',
        'paper.status',
        'paper.assignedTo',
        'paper.marks',
        'paper.batch',
        'paper.school',
        'paper.department',
        'paper.semester',
        'paper.examType',
        'paper.candidateType',
        'paper.notes',
        'paper.organizationId',
      ]);
    }

    const paper = await query.getOne();

    if (!paper) {
      throw new BadRequestException(`Paper with ID ${paperid} not found`);
    }

    return paper;
  }

  async getPaperFileData(paperid: string, organizationId: string): Promise<{ fileData: Buffer; fileName: string }> {
    const paper = await this.papersRepository.findOne({
      where: { paperid, organizationId },
      select: ['fileData', 'fileName'],
    });

    if (!paper) {
      throw new BadRequestException('Paper not found or unauthorized access');
    }

    return {
      fileData: paper.fileData,
      fileName: paper.fileName,
    };
  }

  async updatePaperStatus(
    paperid: string,
    status: string,
    assignedTo?: string,
    marks?: number,
  ): Promise<Paper> {
    const paper = await this.getPaperById(paperid);

    paper.status = status;
    if (assignedTo) paper.assignedTo = assignedTo;
    if (marks !== undefined && marks >= 0) paper.marks = marks;

    return await this.papersRepository.save(paper);
  }

  async updatePaperNotes(paperid: string, notes: string): Promise<Paper> {
    const paper = await this.getPaperById(paperid);
    paper.notes = notes;
    return await this.papersRepository.save(paper);
  }

  async deletePaper(paperid: string, organizationId: string): Promise<void> {
    const paper = await this.getPaperById(paperid);

    if (paper.organizationId !== organizationId) {
      throw new BadRequestException('Unauthorized to delete this paper');
    }

    // Delete from database (fileData will be automatically deleted with the record)
    await this.papersRepository.delete(paperid);
  }

  async getPapersByBatch(organizationId: string, batch: string): Promise<any[]> {
    return this.papersRepository.find({
      where: { organizationId, batch },
      order: { uploadedDate: 'DESC' },
      select: [
        'paperid',
        'roll',
        'examname',
        'fileName',
        'fileSize',
        'uploadedDate',
        'status',
        'assignedTo',
        'marks',
        'batch',
        'school',
        'department',
        'semester',
        'examType',
        'candidateType',
      ],
    });
  }

  async getPapersByStatus(organizationId: string, status: string): Promise<any[]> {
    return this.papersRepository.find({
      where: { organizationId, status },
      order: { uploadedDate: 'DESC' },
      select: [
        'paperid',
        'roll',
        'examname',
        'fileName',
        'fileSize',
        'uploadedDate',
        'status',
        'assignedTo',
        'marks',
        'batch',
        'school',
        'department',
        'semester',
        'examType',
        'candidateType',
      ],
    });
  }

  /**
   * Check if an evaluator (by email) exists in the organization
   */
  async checkEvaluatorExists(evaluatorEmail: string, organizationId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: evaluatorEmail, organizationId, isActive: true },
    });
  }

  /**
   * Send paper to evaluator - updates assignedTo field
   */
  async sendPaperToEvaluator(
    paperid: string,
    evaluatorEmail: string,
    organizationId: string,
  ): Promise<Paper> {
    // Verify paper belongs to this organization
    const paper = await this.papersRepository.findOne({
      where: { paperid, organizationId },
    });

    if (!paper) {
      throw new BadRequestException('Paper not found or unauthorized');
    }

    // Check if evaluator exists in the organization
    const evaluator = await this.checkEvaluatorExists(evaluatorEmail, organizationId);
    if (!evaluator) {
      throw new BadRequestException(
        `Evaluator with email ${evaluatorEmail} does not exist in this organization`,
      );
    }

    // Update paper's assignedTo field
    paper.assignedTo = evaluatorEmail;
    paper.status = 'assigned';
    paper.updatedDate = new Date();

    return await this.papersRepository.save(paper);
  }

  /**
   * Get papers assigned to a specific evaluator
   */
  async getPapersAssignedToEvaluator(
    evaluatorEmail: string,
    organizationId: string,
  ): Promise<any[]> {
    return this.papersRepository.find({
      where: { assignedTo: evaluatorEmail, organizationId },
      order: { uploadedDate: 'DESC' },
      select: [
        'paperid',
        'roll',
        'examname',
        'fileName',
        'fileSize',
        'uploadedDate',
        'status',
        'assignedTo',
        'marks',
        'batch',
        'school',
        'department',
        'semester',
        'examType',
        'candidateType',
        'notes',
      ],
    });
  }
}
