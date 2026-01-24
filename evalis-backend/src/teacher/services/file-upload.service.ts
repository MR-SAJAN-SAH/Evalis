import { Injectable, BadRequestException } from '@nestjs/common';
import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { AnnouncementAttachment } from '../entities/classroom-announcement.entity';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'announcements');
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  private readonly allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

  constructor() {
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: any, classroomId: string): Promise<AnnouncementAttachment> {
    // Validation
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    const fileType = this.detectFileType(file.mimetype);
    this.validateMimeType(file.mimetype, fileType);

    // Create classroom-specific directory
    const classroomDir = path.join(this.uploadDir, classroomId);
    if (!fs.existsSync(classroomDir)) {
      fs.mkdirSync(classroomDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const filepath = path.join(classroomDir, filename);

    // Save file - use buffer if available, otherwise use file.path from Multer
    try {
      if (file.buffer) {
        fs.writeFileSync(filepath, file.buffer);
      } else if (file.path) {
        // Multer has already saved the file, just move it to the classroom directory
        fs.renameSync(file.path, filepath);
      } else {
        throw new BadRequestException('No file data available');
      }
    } catch (err: any) {
      throw new BadRequestException(`Failed to save file: ${err.message}`);
    }

    // Build URL (adjust based on your server setup)
    const fileUrl = `/api/teacher/announcements/files/${classroomId}/${filename}`;

    return {
      id: uuid(),
      name: file.originalname,
      url: fileUrl,
      type: fileType,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
  }

  async deleteFile(classroomId: string, filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, classroomId, filename);

    // Security: Prevent directory traversal
    if (!filepath.startsWith(this.uploadDir)) {
      throw new BadRequestException('Invalid file path');
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  async getFile(classroomId: string, filename: string): Promise<Buffer> {
    const filepath = path.join(this.uploadDir, classroomId, filename);

    // Security: Prevent directory traversal
    if (!filepath.startsWith(this.uploadDir)) {
      throw new BadRequestException('Invalid file path');
    }

    if (!fs.existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    return fs.readFileSync(filepath);
  }

  private detectFileType(
    mimeType: string,
  ): 'image' | 'video' | 'document' | 'audio' {
    if (this.allowedImageTypes.includes(mimeType)) return 'image';
    if (this.allowedVideoTypes.includes(mimeType)) return 'video';
    if (this.allowedAudioTypes.includes(mimeType)) return 'audio';
    if (this.allowedDocTypes.includes(mimeType)) return 'document';
    throw new BadRequestException(`Unsupported file type: ${mimeType}`);
  }

  private validateMimeType(
    mimeType: string,
    fileType: 'image' | 'video' | 'document' | 'audio',
  ) {
    const allowedTypes =
      fileType === 'image'
        ? this.allowedImageTypes
        : fileType === 'video'
          ? this.allowedVideoTypes
          : fileType === 'audio'
            ? this.allowedAudioTypes
            : this.allowedDocTypes;

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(`Invalid ${fileType} file type: ${mimeType}`);
    }
  }

  getFileMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
