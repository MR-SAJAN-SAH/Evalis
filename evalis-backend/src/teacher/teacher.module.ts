import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TeacherSubject } from './entities/teacher-subject.entity';
import { SubjectInvitation } from './entities/subject-invitation.entity';
import { CandidateSubject } from './entities/candidate-subject.entity';
import { TeacherNotification } from './entities/teacher-notification.entity';
import { TeacherClassroom } from './entities/teacher-classroom.entity';
import { ClassroomInvitation } from './entities/classroom-invitation.entity';
import { CandidateClassroom } from './entities/candidate-classroom.entity';
import { ClassroomAnnouncement } from './entities/classroom-announcement.entity';
import { User } from '../users/entities/user.entity';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { ClassroomService } from './classroom.service';
import { AnnouncementService } from './services/announcement.service';
import { FileUploadService } from './services/file-upload.service';
import { ClassroomController, CandidateClassroomController } from './classroom.controller';
import { AnnouncementController } from './announcement.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeacherSubject,
      SubjectInvitation,
      CandidateSubject,
      TeacherNotification,
      TeacherClassroom,
      ClassroomInvitation,
      CandidateClassroom,
      ClassroomAnnouncement,
      User,
    ]),
    MulterModule.register({
      dest: './uploads/announcements',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [
    TeacherController,
    ClassroomController,
    CandidateClassroomController,
    AnnouncementController,
  ],
  providers: [TeacherService, ClassroomService, AnnouncementService, FileUploadService],
  exports: [TeacherService, ClassroomService, AnnouncementService, FileUploadService],
})
export class TeacherModule {}
