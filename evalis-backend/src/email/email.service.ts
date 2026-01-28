import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Configure your email service here
    // For development, we're using environment variables
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true' ? true : false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // Validate that required email config is present
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn(
        'Email service not fully configured. Email sending may fail. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.',
      );
    }

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  /**
   * Sends a welcome email with credentials to newly created users
   */
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    password: string,
    organizationName: string,
    customMessage?: string,
    emailTemplate?: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      console.log('📧 sendWelcomeEmail called with:', { userEmail, userName, organizationName, emailTemplate: emailTemplate || 'welcome' });
      
      const loginUrl = process.env.LOGIN_URL || 'http://localhost:5173/login';
      console.log('📧 Login URL:', loginUrl);
      
      const htmlContent = this.getEmailTemplate(
        emailTemplate || 'welcome',
        userName,
        userEmail,
        password,
        organizationName,
        loginUrl,
        customMessage,
        userId,
      );

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userEmail,
        subject: this.getEmailSubject(emailTemplate || 'welcome', organizationName),
        html: htmlContent,
      };

      console.log('📧 Sending mail with options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
      
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent! Message ID:', info.messageId);
      this.logger.log(
        `Email (${emailTemplate || 'welcome'}) sent successfully to ${userEmail}. Message ID: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Email send error:', error);
      console.error('   Error message:', error.message);
      console.error('   Error code:', error.code);
      
      this.logger.error(
        `Failed to send email to ${userEmail}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Get email template based on template type
   */
  private getEmailTemplate(
    templateType: string,
    userName: string,
    userEmail: string,
    password: string,
    organizationName: string,
    loginUrl: string,
    customMessage?: string,
    userId?: string,
  ): string {
    switch (templateType) {
      case 'credentials':
        return this.getCredentialsOnlyTemplate(userName, userEmail, password, organizationName, loginUrl, customMessage);
      case 'reminder':
        return this.getReminderEmailTemplate(userName, organizationName, loginUrl, customMessage);
      case 'verification':
        return this.getVerificationEmailTemplate(userName, userEmail, organizationName, customMessage);
      case 'personalDetail':
        return this.getPersonalDetailFormTemplate(userName, userId || '');
      case 'welcome':
      default:
        return this.getWelcomeEmailTemplate(userName, userEmail, password, organizationName, loginUrl, customMessage);
    }
  }

  /**
   * Get email subject based on template type
   */
  private getEmailSubject(templateType: string, organizationName: string): string {
    switch (templateType) {
      case 'credentials':
        return `Your Login Credentials - ${organizationName}`;
      case 'reminder':
        return `Login Reminder - ${organizationName}`;
      case 'verification':
        return `Account Verification - ${organizationName}`;
      case 'personalDetail':
        return `Complete Your Profile - ${organizationName}`;
      case 'welcome':
      default:
        return `Welcome to ${organizationName} - Your Login Credentials`;
    }
  }

  /**
   * HTML template for welcome email
   */
  private getWelcomeEmailTemplate(
    userName: string,
    userEmail: string,
    password: string,
    organizationName: string,
    loginUrl: string,
    customMessage?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .credentials-box {
              background-color: #f5f5f5;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .credential-item {
              margin: 15px 0;
              display: flex;
              align-items: center;
            }
            .credential-label {
              font-weight: bold;
              color: #667eea;
              min-width: 100px;
            }
            .credential-value {
              word-break: break-all;
              font-family: 'Courier New', monospace;
              background-color: white;
              padding: 8px 12px;
              border-radius: 4px;
              flex-grow: 1;
            }
            .login-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .login-button:hover {
              opacity: 0.9;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #eee;
              margin-top: 20px;
            }
            .organization-name {
              color: #667eea;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Evalis!</h1>
              <p>Your account has been created successfully</p>
            </div>
            
            <div class="content">
              <h2>Hello ${userName},</h2>
              
              <p>Welcome to <span class="organization-name">${organizationName}</span>! Your account has been successfully created and is ready to use.</p>
              
              <h3>Your Login Credentials:</h3>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">${userEmail}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <p style="margin: 10px 0 0 0;">
                  Please change your password after your first login for security purposes. 
                  Do not share your credentials with anyone else.
                </p>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" class="login-button">Login Now</a>
              </p>
              
              ${customMessage ? `
              <div style="background-color: #e8f4f8; border-left: 4px solid #0288d1; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Message from Admin:</strong>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${customMessage}</p>
              </div>
              ` : ''}
              
              <h3>Getting Started:</h3>
              <ul>
                <li>Visit the login page using the button above</li>
                <li>Use your email and password to log in</li>
                <li>Update your profile information (optional)</li>
                <li>Start using the platform</li>
              </ul>
              
              <h3>Need Help?</h3>
              <p>
                If you have any questions or issues accessing your account, 
                please contact our support team for assistance.
              </p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Evalis. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for credentials only email
   */
  private getCredentialsOnlyTemplate(
    userName: string,
    userEmail: string,
    password: string,
    organizationName: string,
    loginUrl: string,
    customMessage?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials-box { background-color: #f5f5f5; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .credential-item { margin: 12px 0; }
            .credential-label { font-weight: bold; color: #667eea; }
            .credential-value { font-family: 'Courier New', monospace; background-color: white; padding: 6px 10px; border-radius: 4px; margin-top: 4px; }
            .login-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 4px; margin: 15px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Login Credentials</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Here are your login credentials for ${organizationName}:</p>
              
              <div class="credentials-box">
                <div class="credential-item">
                  <span class="credential-label">Email:</span>
                  <div class="credential-value">${userEmail}</div>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span>
                  <div class="credential-value">${password}</div>
                </div>
              </div>
              
              <p><a href="${loginUrl}" class="login-button">Log In Now</a></p>
              
              ${customMessage ? `
              <div style="background-color: #e8f4f8; border-left: 4px solid #0288d1; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Additional Information:</strong>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${customMessage}</p>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Evalis. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for reminder email
   */
  private getReminderEmailTemplate(
    userName: string,
    organizationName: string,
    loginUrl: string,
    customMessage?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .login-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 4px; margin: 15px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Quick Start Guide</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Welcome to ${organizationName}! Here are some useful tips to get you started:</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📚 Getting Started:</h3>
                <ul>
                  <li>Log in to your account to access the dashboard</li>
                  <li>Complete your profile with accurate information</li>
                  <li>Explore the available features and modules</li>
                  <li>Read the documentation if needed</li>
                </ul>
              </div>
              
              ${customMessage ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Important Notes:</strong>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${customMessage}</p>
              </div>
              ` : ''}
              
              <p><a href="${loginUrl}" class="login-button">Go to Platform</a></p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Evalis. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for verification email
   */
  private getVerificationEmailTemplate(
    userName: string,
    userEmail: string,
    organizationName: string,
    customMessage?: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .verify-box { background-color: #f0f7ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-item { margin: 10px 0; }
            .info-label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Verification</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>Your account with ${organizationName} has been created and verified.</p>
              
              <div class="verify-box">
                <h3 style="margin-top: 0;">✓ Verified Account Information</h3>
                <div class="info-item">
                  <span class="info-label">Email:</span> ${userEmail}
                </div>
                <div class="info-item">
                  <span class="info-label">Organization:</span> ${organizationName}
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span> <span style="color: green; font-weight: bold;">Active</span>
                </div>
              </div>
              
              ${customMessage ? `
              <div style="background-color: #ede7f6; border-left: 4px solid #9c27b0; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Additional Details:</strong>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${customMessage}</p>
              </div>
              ` : ''}
              
              <p>You can now access all services and features available in your plan.</p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Evalis. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for personal detail form email
   */
  private getPersonalDetailFormTemplate(userName: string, userId: string): string {
    const formActionUrl = process.env.API_URL || 'http://localhost:3000';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .form-section { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #667eea; border-radius: 4px; }
            .form-section h3 { margin-top: 0; color: #667eea; }
            .form-group { margin: 15px 0; }
            .form-label { font-weight: bold; display: block; margin-bottom: 5px; }
            .form-input, .form-select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; font-size: 14px; box-sizing: border-box; }
            .form-input:focus, .form-select:focus { outline: none; border-color: #667eea; background-color: #f9f9ff; }
            .submit-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .submit-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
            .submit-button:hover { opacity: 0.9; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Complete Your Profile</h1>
              <p>Please fill in your personal details</p>
            </div>
            
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Please complete your profile by filling in the details below. This information helps us serve you better.</p>
              
              <form id="detailForm" method="POST" action="${formActionUrl}/api/users/public/submit-personal-details">
                <input type="hidden" name="userId" value="${userId}">
                
                <!-- Contact Information -->
                <div class="form-section">
                  <h3>📱 Contact Information</h3>
                  <div class="form-group">
                    <label class="form-label">Phone Number <span style="color:red;">*</span></label>
                    <input type="tel" class="form-input" name="phone" placeholder="Enter phone number" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Personal Email</label>
                    <input type="email" class="form-input" name="personalEmail" placeholder="Enter personal email">
                  </div>
                </div>
                
                <!-- Personal Information -->
                <div class="form-section">
                  <h3>👤 Personal Information</h3>
                  <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-input" name="dateOfBirth">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select class="form-select" name="gender">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Country</label>
                    <input type="text" class="form-input" name="country" placeholder="Enter country">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Profile URL</label>
                    <input type="url" class="form-input" name="profileUrl" placeholder="https://example.com/profile">
                  </div>
                </div>
                
                <!-- Academic Information -->
                <div class="form-section">
                  <h3>🎓 Academic Information</h3>
                  <div class="form-group">
                    <label class="form-label">School/College</label>
                    <input type="text" class="form-input" name="schoolCollege" placeholder="Enter school/college name">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Department</label>
                    <input type="text" class="form-input" name="department" placeholder="Enter department">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Roll Number</label>
                    <input type="text" class="form-input" name="rollNumber" placeholder="Enter roll number">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Registration Number</label>
                    <input type="text" class="form-input" name="registrationNumber" placeholder="Enter registration number">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Admission Batch</label>
                    <input type="number" class="form-input" name="admissionBatch" placeholder="E.g., 2020, 2021">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Current Semester</label>
                    <input type="number" class="form-input" name="currentSemester" placeholder="E.g., 4, 6">
                  </div>
                  <div class="form-group">
                    <label class="form-label">CGPA</label>
                    <input type="number" class="form-input" name="cgpa" placeholder="E.g., 8.5" step="0.01" min="0" max="10">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Graduated?</label>
                    <select class="form-select" name="graduated">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                
                <!-- Additional Information -->
                <div class="form-section">
                  <h3>💼 Additional Information</h3>
                  <div class="form-group">
                    <label class="form-label">Scholarship</label>
                    <input type="text" class="form-input" name="scholarship" placeholder="E.g., Merit-based, Need-based">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Portfolio Link</label>
                    <input type="url" class="form-input" name="portfolioLink" placeholder="https://portfolio.example.com">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Resume URL</label>
                    <input type="url" class="form-input" name="resumeUrl" placeholder="https://drive.google.com/...">
                  </div>
                  <div class="form-group">
                    <label class="form-label">GitHub Profile</label>
                    <input type="url" class="form-input" name="github" placeholder="https://github.com/username">
                  </div>
                </div>
                
                <!-- Parent Information -->
                <div class="form-section">
                  <h3>👨‍👩‍👧 Parent Information</h3>
                  <div class="form-group">
                    <label class="form-label">Parent Name</label>
                    <input type="text" class="form-input" name="parentName" placeholder="Enter parent name">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Parent Phone Number</label>
                    <input type="tel" class="form-input" name="parentPhone" placeholder="Enter phone number">
                  </div>
                </div>
                
                <div class="submit-section">
                  <button type="submit" class="submit-button">Submit Details</button>
                </div>
              </form>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Evalis. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Test email configuration by sending a test email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(
        `Email service connection verification failed: ${error.message}`,
      );
      return false;
    }
  }
}
