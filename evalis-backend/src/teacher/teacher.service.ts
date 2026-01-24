import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSubject } from './entities/teacher-subject.entity';
import { SubjectInvitation } from './entities/subject-invitation.entity';
import { CandidateSubject } from './entities/candidate-subject.entity';
import { TeacherNotification } from './entities/teacher-notification.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InviteCandidatesDto } from './dto/invite-candidates.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(TeacherSubject)
    private readonly subjectRepository: Repository<TeacherSubject>,
    @InjectRepository(SubjectInvitation)
    private readonly invitationRepository: Repository<SubjectInvitation>,
    @InjectRepository(CandidateSubject)
    private readonly candidateSubjectRepository: Repository<CandidateSubject>,
    @InjectRepository(TeacherNotification)
    private readonly notificationRepository: Repository<TeacherNotification>,
  ) {}

  async createSubject(
    teacherId: string,
    createSubjectDto: CreateSubjectDto,
  ): Promise<TeacherSubject> {
    const subject = this.subjectRepository.create({
      teacherId,
      name: createSubjectDto.name,
      description: createSubjectDto.description,
      options: createSubjectDto.options,
      organizationId: createSubjectDto.organizationId,
    });
    return this.subjectRepository.save(subject);
  }

  async getTeacherSubjects(teacherId: string): Promise<TeacherSubject[]> {
    return this.subjectRepository.find({
      where: { teacherId },
      relations: ['invitations', 'candidateSubjects'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubjectDetail(
    teacherId: string,
    subjectId: string,
  ): Promise<TeacherSubject | null> {
    return this.subjectRepository.findOne({
      where: { id: subjectId, teacherId },
      relations: ['invitations', 'candidateSubjects'],
    });
  }

  async updateSubject(
    teacherId: string,
    subjectId: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<TeacherSubject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, teacherId },
    });
    if (!subject) {
      throw new Error('Subject not found');
    }
    Object.assign(subject, updateSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async deleteSubject(teacherId: string, subjectId: string): Promise<void> {
    const result = await this.subjectRepository.delete({
      id: subjectId,
      teacherId,
    });
    if (result.affected === 0) {
      throw new Error('Subject not found');
    }
  }

  async inviteCandidates(
    teacherId: string,
    subjectId: string,
    inviteCandidatesDto: InviteCandidatesDto,
  ): Promise<SubjectInvitation[]> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, teacherId },
    });
    if (!subject) {
      throw new Error('Subject not found');
    }

    const invitations = inviteCandidatesDto.emails.map((email) =>
      this.invitationRepository.create({
        subjectId,
        candidateEmail: email,
        status: 'pending',
        teacherId,
      }),
    );

    return this.invitationRepository.save(invitations);
  }

  async getInvitations(teacherId: string): Promise<SubjectInvitation[]> {
    return this.invitationRepository.find({
      where: { teacherId },
      relations: ['subject'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNotifications(teacherId: string): Promise<TeacherNotification[]> {
    return this.notificationRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId },
      { read: true },
    );
  }

  async handleInvitationResponse(
    invitationId: string,
    status: 'accepted' | 'rejected',
    candidateId: string,
  ): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['subject'],
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Update invitation status
    invitation.status = status;
    invitation.respondedAt = new Date();
    await this.invitationRepository.save(invitation);

    // If accepted, add candidate to subject
    if (status === 'accepted') {
      const candidateSubject = this.candidateSubjectRepository.create({
        subjectId: invitation.subjectId,
        candidateId,
        candidateEmail: invitation.candidateEmail,
        status: 'active',
      });
      await this.candidateSubjectRepository.save(candidateSubject);
    }

    // Create notification for teacher
    const notification = this.notificationRepository.create({
      teacherId: invitation.teacherId,
      type: status,
      subjectId: invitation.subjectId,
      subjectName: invitation.subject.name,
      candidateEmail: invitation.candidateEmail,
      message: `${invitation.candidateEmail} ${status} your invitation to ${invitation.subject.name}`,
    });
    await this.notificationRepository.save(notification);
  }

  async getCandidateSubjects(candidateId: string): Promise<CandidateSubject[]> {
    return this.candidateSubjectRepository.find({
      where: { candidateId, status: 'active' },
      relations: ['subject'],
      order: { createdAt: 'DESC' },
    });
  }
}
