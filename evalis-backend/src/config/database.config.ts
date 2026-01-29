import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SubscriptionPlan } from '../superadmin/entities/subscription-plan.entity';
import { Admin } from '../superadmin/entities/admin.entity';
import { Organization } from '../superadmin/entities/organization.entity';
import { SuperAdmin } from '../superadmin/entities/superadmin.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Role } from '../users/entities/role.entity';
import { Permission } from '../users/entities/permission.entity';
import { Exam } from '../exams/entities/exam.entity';
import { Question } from '../exams/entities/question.entity';
import { ProgrammingQuestion } from '../exams/entities/programming-question.entity';
import { ExamAccess } from '../exams/entities/exam-access.entity';
import { EvaluationMapping } from '../exams/entities/evaluation-mapping.entity';
import { ExamSubmission } from '../exams/entities/exam-submission.entity';
import { TeacherClassroom } from '../teacher/entities/teacher-classroom.entity';
import { ClassroomInvitation } from '../teacher/entities/classroom-invitation.entity';
import { CandidateClassroom } from '../teacher/entities/candidate-classroom.entity';
import { ClassroomAnnouncement } from '../teacher/entities/classroom-announcement.entity';
import { Paper } from '../papers/paper.entity';

dotenv.config();

// Parse DATABASE_URL if provided (for cloud deployments like Render)
interface DatabaseUrlConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

function parseDatabaseUrl(): DatabaseUrlConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {};
  }
  
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname || undefined,
      port: url.port ? parseInt(url.port) : undefined,
      username: url.username || undefined,
      password: url.password || undefined,
      database: url.pathname.slice(1) || undefined, // Remove leading slash
    };
  } catch (error) {
    console.warn('Failed to parse DATABASE_URL, using individual env vars');
    return {};
  }
}

const databaseUrlConfig = parseDatabaseUrl();

export const superadminDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: databaseUrlConfig.host || process.env.SUPERADMIN_DB_HOST || 'localhost',
  port: (databaseUrlConfig.port as number) || parseInt(process.env.SUPERADMIN_DB_PORT || '5432') || 5432,
  username: databaseUrlConfig.username || process.env.SUPERADMIN_DB_USERNAME || 'postgres',
  password: databaseUrlConfig.password || process.env.SUPERADMIN_DB_PASSWORD || 'password',
  database: databaseUrlConfig.database || process.env.SUPERADMIN_DB_NAME || 'evalis_superadmin',
  entities: [SuperAdmin, SubscriptionPlan, Admin, Organization, User, UserProfile, Role, Permission, Exam, Question, ProgrammingQuestion, ExamAccess, EvaluationMapping, ExamSubmission, TeacherClassroom, ClassroomInvitation, CandidateClassroom, ClassroomAnnouncement, Paper],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export function getOrganizationDatabaseConfig(
  organizationName: string,
): TypeOrmModuleOptions {
  const dbName = databaseUrlConfig.database || `evalis_${organizationName.toLowerCase()}`;
  return {
    type: 'postgres',
    host: databaseUrlConfig.host || process.env.SUPERADMIN_DB_HOST || 'localhost',
    port: (databaseUrlConfig.port as number) || parseInt(process.env.SUPERADMIN_DB_PORT || '5432') || 5432,
    username: databaseUrlConfig.username || process.env.SUPERADMIN_DB_USERNAME || 'postgres',
    password: databaseUrlConfig.password || process.env.SUPERADMIN_DB_PASSWORD || 'password',
    database: dbName,
    entities: [TeacherClassroom, ClassroomInvitation, CandidateClassroom, ClassroomAnnouncement],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}
