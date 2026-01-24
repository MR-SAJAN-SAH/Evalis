import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectInvitation } from '../teacher/entities/subject-invitation.entity';
import { CandidateSubject } from '../teacher/entities/candidate-subject.entity';
import { TeacherService } from '../teacher/teacher.service';

export interface CandidateNotification {
  id: string;
  candidateId: string;
  type: 'invitation' | 'accepted' | 'rejected';
  subjectId: string;
  subjectName: string;
  teacherEmail: string;
  message: string;
  invitationId?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(SubjectInvitation)
    private readonly invitationRepository: Repository<SubjectInvitation>,
    @InjectRepository(CandidateSubject)
    private readonly candidateSubjectRepository: Repository<CandidateSubject>,
    private readonly teacherService: TeacherService,
  ) {}

  async getPendingInvitations(candidateEmail: string): Promise<SubjectInvitation[]> {
    return this.invitationRepository.find({
      where: { candidateEmail, status: 'pending' },
      relations: ['subject'],
      order: { createdAt: 'DESC' },
    });
  }

  async respondToInvitation(
    invitationId: string,
    status: 'accepted' | 'rejected',
    candidateId: string,
    candidateEmail: string,
  ): Promise<void> {
    await this.teacherService.handleInvitationResponse(
      invitationId,
      status,
      candidateId,
    );

    // Update invitation with candidate ID
    await this.invitationRepository.update(
      { id: invitationId },
      { candidateId, candidateName: candidateEmail },
    );
  }

  async getCandidateSubjects(candidateId: string): Promise<CandidateSubject[]> {
    return this.candidateSubjectRepository.find({
      where: { candidateId, status: 'active' },
      relations: ['subject'],
    });
  }

  async getNotifications(candidateId: string): Promise<any[]> {
    // This would connect to a CandidateNotification table
    // For now, returning pending invitations as notifications
    return [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    // Implementation for marking notifications as read
  }
}
