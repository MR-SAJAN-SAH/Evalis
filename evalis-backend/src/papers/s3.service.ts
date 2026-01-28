import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET_NAME || 'evalis-papers';
  private region = process.env.AWS_REGION || 'us-east-1';

  constructor() {
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(
    key: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Add metadata for organization and roll number
      Metadata: {
        'upload-date': new Date().toISOString(),
      },
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      
      // Return the S3 file path
      return `s3://${this.bucketName}/${key}`;
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  // Generate organized S3 path: org-id/batch/department/semester/year/roll_examname.pdf
  generateS3Key(
    organizationId: string,
    batch: string,
    department: string,
    semester: string,
    filename: string,
  ): string {
    const year = new Date().getFullYear();
    return `papers/${organizationId}/${batch}/${department}/${semester}/${year}/${filename}`;
  }
}
