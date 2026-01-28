// Type definitions and interfaces for Email Service
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}

export interface SentMessageInfo {
  messageId: string;
  response: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export type EmailTransporter = Transporter;

