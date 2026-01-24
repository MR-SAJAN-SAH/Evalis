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
import { ExamModule } from './exams/exam.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(superadminDatabaseConfig),
    TypeOrmModule.forFeature([SuperAdmin, Admin, Organization, SubscriptionPlan, User, UserProfile]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
    ExamModule,
    TeacherModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule implements OnModuleInit {
  constructor(private authService: AuthService) {}

  async onModuleInit() {
    await this.authService.initializeSubscriptionPlans();
  }
}
