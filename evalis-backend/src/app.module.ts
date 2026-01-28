import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { superadminDatabaseConfig } from './config/database.config';
import { Admin } from './superadmin/entities/admin.entity';
import { Organization } from './superadmin/entities/organization.entity';
import { SubscriptionPlan } from './superadmin/entities/subscription-plan.entity';
import { SuperAdmin } from './superadmin/entities/superadmin.entity';
import { User } from './users/entities/user.entity';
import { UserProfile } from './users/entities/user-profile.entity';
import { Role } from './users/entities/role.entity';
import { Permission } from './users/entities/permission.entity';
import { Exam } from './exams/entities/exam.entity';
import { Question } from './exams/entities/question.entity';
import { ProgrammingQuestion } from './exams/entities/programming-question.entity';
import { ExamAccess } from './exams/entities/exam-access.entity';
import { EvaluationMapping } from './exams/entities/evaluation-mapping.entity';
import { ExamSubmission } from './exams/entities/exam-submission.entity';
import { ExamModule } from './exams/exam.module';
import { TeacherModule } from './teacher/teacher.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entities/chat.entity';
import { ChatGroup } from './chat/entities/chat-group.entity';
import { ChatGroupMember } from './chat/entities/chat-group-member.entity';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { ChatNotification } from './chat/entities/chat-notification.entity';
import { UserOnlineStatus } from './chat/entities/user-online-status.entity';
import { PapersModule } from './papers/papers.module';
import { Paper } from './papers/paper.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { CandidateNotification } from './notifications/entities/candidate-notification.entity';
import { AuditLogModule } from './common/audit-log/audit-log.module';
import { AuditLog } from './common/audit-log/audit-log.entity';
import { AIModule } from './ai/ai.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(superadminDatabaseConfig),
    TypeOrmModule.forFeature([SuperAdmin, Admin, Organization, SubscriptionPlan, User, UserProfile, Role, Permission, Exam, Question, ProgrammingQuestion, ExamAccess, EvaluationMapping, ExamSubmission, Chat, ChatGroup, ChatGroupMember, ChatMessage, ChatNotification, UserOnlineStatus, Paper, CandidateNotification, AuditLog]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
    ExamModule,
    TeacherModule,
    UsersModule,
    ChatModule,
    PapersModule,
    NotificationsModule,
    AuditLogModule,
    AIModule,
    EmailModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule implements OnModuleInit {
  constructor(private authService: AuthService) {
    console.log('🔐 [AppModule] JWT Configuration:', {
      jwtSecret: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'using default',
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
    });
  }

  async onModuleInit() {
    await this.authService.initializeSubscriptionPlans();
  }
}
