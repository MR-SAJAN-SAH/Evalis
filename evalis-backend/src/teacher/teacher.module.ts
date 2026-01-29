import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TeacherSubject } from './entities/teacher-subject.entity';
import { SubjectInvitation } from './entities/subject-invitation.entity';
import { CandidateSubject } from './entities/candidate-subject.entity';
import { TeacherNotification } from './entities/teacher-notification.entity';
import { TeacherClassroom } from './entities/teacher-classroom.entity';
import { CandidateClassroom } from './entities/candidate-classroom.entity';
import { ClassroomAnnouncement } from './entities/classroom-announcement.entity';
import { User } from '../users/entities/user.entity';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { AnnouncementService } from './services/announcement.service';
import { FileUploadService } from './services/file-upload.service';
import { AnnouncementController } from './announcement.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeacherSubject,
      SubjectInvitation,
      CandidateSubject,
      TeacherNotification,
      User,
      TeacherClassroom,
      CandidateClassroom,
      ClassroomAnnouncement,
    ]),
    MulterModule.register({
      dest: './uploads/announcements',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [TeacherController, AnnouncementController],
  providers: [TeacherService, AnnouncementService, FileUploadService],
  exports: [TeacherService, AnnouncementService, FileUploadService],
})
export class TeacherModule {}
