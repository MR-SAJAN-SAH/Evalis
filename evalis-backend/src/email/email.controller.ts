import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-to-user')
  @HttpCode(HttpStatus.OK)
  async sendEmailToUser(@Body() body: any) {
    const { userEmail, userName, password, organizationName, customMessage, emailTemplate, userId } = body;

    if (!userEmail || !userName) {
      throw new BadRequestException('Email and name are required');
    }

    console.log('📧 Send email request received for:', userEmail, 'with template:', emailTemplate || 'welcome');

    try {
      const sent = await this.emailService.sendWelcomeEmail(
        userEmail,
        userName,
        password || 'N/A',
        organizationName || 'Evalis',
        customMessage,
        emailTemplate || 'welcome',
        userId,
      );

      if (sent) {
        return {
          success: true,
          message: `Email sent successfully to ${userEmail}`,
        };
      } else {
        return {
          success: false,
          message: `Failed to send email to ${userEmail}. Check backend logs for details.`,
        };
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmailConfiguration() {
    try {
      const verified = await this.emailService.verifyConnection();
      return {
        verified,
        message: verified
          ? 'Email service is configured correctly'
          : 'Email service configuration failed. Check .env file.',
      };
    } catch (error) {
      throw new BadRequestException(`Email verification failed: ${error.message}`);
    }
  }
}
