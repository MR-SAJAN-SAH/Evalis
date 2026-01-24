import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherClassroom, ClassroomSection } from './entities/teacher-classroom.entity';
import { ClassroomInvitation } from './entities/classroom-invitation.entity';
import { CandidateClassroom } from './entities/candidate-classroom.entity';
import { CreateClassroomDto, UpdateClassroomDto, InviteCandidatesToClassroomDto } from './dto/classroom.dto';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(TeacherClassroom)
    private readonly classroomRepository: Repository<TeacherClassroom>,
    @InjectRepository(ClassroomInvitation)
    private readonly invitationRepository: Repository<ClassroomInvitation>,
    @InjectRepository(CandidateClassroom)
    private readonly candidateClassroomRepository: Repository<CandidateClassroom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ==================== CLASSROOM CRUD ====================

  async createClassroom(
    teacherId: string,
    organizationId: string,
    createClassroomDto: CreateClassroomDto,
  ): Promise<TeacherClassroom> {
    const defaultSections: ClassroomSection[] = [
      { id: crypto.randomUUID(), name: 'Stream' },
      { id: crypto.randomUUID(), name: 'Materials' },
      { id: crypto.randomUUID(), name: 'Assignments' },
    ];

    const sections = createClassroomDto.sections
      ? createClassroomDto.sections.map((name: string) => ({
          id: crypto.randomUUID(),
          name,
        }))
      : defaultSections;

    const classroom = new TeacherClassroom();
    classroom.teacherId = teacherId;
    classroom.organizationId = organizationId;
    classroom.name = createClassroomDto.name;
    classroom.description = createClassroomDto.description || '';
    classroom.subject = createClassroomDto.subject;
    classroom.sections = sections;
    classroom.metadata = createClassroomDto.metadata || {};
    classroom.classCode = this.generateClassCode();
    classroom.status = 'active';

    return this.classroomRepository.save(classroom);
  }

  async getTeacherClassrooms(teacherId: string): Promise<TeacherClassroom[]> {
    return this.classroomRepository.find({
      where: { teacherId },
      relations: ['invitations', 'candidateClassrooms'],
      order: { createdAt: 'DESC' },
    });
  }

  async getClassroomDetail(
    teacherId: string,
    classroomId: string,
  ): Promise<TeacherClassroom> {
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId, teacherId },
      relations: ['invitations', 'candidateClassrooms'],
    });

    if (!classroom) {
      throw new UnauthorizedException('Classroom not found or access denied');
    }

    return classroom;
  }

  async updateClassroom(
    teacherId: string,
    classroomId: string,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<TeacherClassroom> {
    let classroom = await this.getClassroomDetail(teacherId, classroomId);
    
    if (updateClassroomDto.name) classroom.name = updateClassroomDto.name;
    if (updateClassroomDto.description) classroom.description = updateClassroomDto.description;
    if (updateClassroomDto.subject) classroom.subject = updateClassroomDto.subject;
    if (updateClassroomDto.status) classroom.status = updateClassroomDto.status;
    if (updateClassroomDto.sections) {
      classroom.sections = updateClassroomDto.sections.map((name: string) => ({
        id: crypto.randomUUID(),
        name,
      }));
    }
    if (updateClassroomDto.metadata) classroom.metadata = { ...classroom.metadata, ...updateClassroomDto.metadata };

    return this.classroomRepository.save(classroom);
  }

  async deleteClassroom(teacherId: string, classroomId: string): Promise<void> {
    const classroom = await this.getClassroomDetail(teacherId, classroomId);
    await this.classroomRepository.remove(classroom);
  }

  // ==================== INVITATIONS ====================

  async inviteCandidates(
    teacherId: string,
    classroomId: string,
    inviteDto: InviteCandidatesToClassroomDto,
  ): Promise<ClassroomInvitation[]> {
    console.log('🔍 inviteCandidates called with:', { teacherId, classroomId, emailCount: inviteDto.emails?.length });
    
    // Get classroom - allow both the owner (teacherId) and any evaluator
    const classroom = await this.classroomRepository.findOne({
      where: { id: classroomId },
      relations: ['invitations', 'candidateClassrooms'],
    });

    console.log('🏫 Found classroom:', classroom?.id, classroom?.name);

    if (!classroom) {
      throw new Error('Classroom not found');
    }

    // Validate emails
    if (!inviteDto.emails || inviteDto.emails.length === 0) {
      throw new Error('No emails provided');
    }

    const invitations: ClassroomInvitation[] = [];
    const invitationsToInsert: any[] = [];
    const invalidEmails: string[] = [];

    for (const email of inviteDto.emails) {
      // Validate email format
      if (!email || !email.includes('@')) {
        console.warn(`Invalid email format: ${email}`);
        invalidEmails.push(email);
        continue;
      }

      // Check if user exists in the organization
      const userExists = await this.userRepository.findOne({
        where: { email: email, organizationId: classroom.organizationId },
      });

      if (!userExists) {
        console.warn(`User with email ${email} does not exist in organization ${classroom.organizationId}`);
        invalidEmails.push(email);
        continue;
      }

      // Check if candidate has already joined
      const alreadyJoined = await this.candidateClassroomRepository.findOne({
        where: { classroomId, candidateEmail: email },
      });

      if (alreadyJoined) {
        console.warn(`Candidate ${email} has already joined classroom ${classroomId}`);
        continue; // Skip if already joined
      }

      // Check if already invited
      const existing = await this.invitationRepository.findOne({
        where: { classroomId, candidateEmail: email },
      });

      if (existing && existing.status === 'pending') {
        continue; // Skip if already pending
      }

      console.log('📧 Creating invitation for:', email, 'in classroom:', classroomId);
      
      invitationsToInsert.push({
        classroomId: classroomId,
        teacherId: classroom.teacherId,
        candidateEmail: email,
        invitationToken: this.generateInvitationToken(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Throw error if invalid emails found
    if (invalidEmails.length > 0) {
      const invalidMsg = invalidEmails.join(', ');
      throw new BadRequestException(
        `The following email(s) do not exist in your organization: ${invalidMsg}. Only existing users can be invited to classrooms.`
      );
    }

    // Insert all invitations at once
    if (invitationsToInsert.length > 0) {
      // Validate all invitations have classroomId
      for (const inv of invitationsToInsert) {
        if (!inv.classroomId) {
          console.error('❌ Invitation missing classroomId:', inv);
          throw new Error(`Invitation for ${inv.candidateEmail} is missing classroomId`);
        }
      }
      
      console.log(`📋 Preparing to insert ${invitationsToInsert.length} invitations with classroomId: ${classroomId}`);
      const result = await this.invitationRepository.insert(invitationsToInsert);
      console.log('✅ Inserted invitations:', result.identifiers.length);
      
      // Fetch the inserted invitations
      const insertedInvitations = await this.invitationRepository.find({
        where: { classroomId, status: 'pending' },
        order: { createdAt: 'DESC' },
        take: invitationsToInsert.length,
      });
      invitations.push(...insertedInvitations);
    }

    // Update classroom stats
    classroom.totalInvites = invitations.length + (classroom.totalInvites || 0);
    classroom.pendingCount = await this.invitationRepository.count({
      where: { classroomId, status: 'pending' },
    });
    await this.classroomRepository.save(classroom);

    return invitations;
  }

  async getClassroomInvitations(
    teacherId: string,
    classroomId: string,
  ): Promise<ClassroomInvitation[]> {
    await this.getClassroomDetail(teacherId, classroomId); // Verify access

    return this.invitationRepository.find({
      where: { classroomId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingInvitations(candidateEmail: string): Promise<ClassroomInvitation[]> {
    return this.invitationRepository.find({
      where: { candidateEmail, status: 'pending' },
      relations: ['classroom'],
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== CANDIDATE ENROLLMENT ====================

  async respondToInvitation(
    invitationId: string,
    candidateId: string,
    candidateEmail: string,
    status: 'accepted' | 'rejected',
  ): Promise<ClassroomInvitation> {
    console.log(`📨 Processing invitation response:`, {
      invitationId,
      candidateId,
      candidateEmail,
      status,
    });

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['classroom'],
    });

    console.log(`Found invitation:`, invitation);

    if (!invitation) {
      console.error(`❌ Invitation not found: ${invitationId}`);
      throw new UnauthorizedException('Invitation not found');
    }

    // Verify the candidate email matches
    if (invitation.candidateEmail !== candidateEmail) {
      console.warn(`⚠️  Email mismatch. Invitation email: ${invitation.candidateEmail}, Request email: ${candidateEmail}`);
      // Allow processing anyway with a warning
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(
        `Invitation has already been responded to. Current status: ${invitation.status}`,
      );
    }

    // Check if candidate has already joined the classroom
    if (status === 'accepted') {
      const alreadyJoined = await this.candidateClassroomRepository.findOne({
        where: { classroomId: invitation.classroomId, candidateId },
      });

      if (alreadyJoined) {
        console.warn(`Candidate ${candidateEmail} has already joined classroom ${invitation.classroomId}`);
        throw new BadRequestException(
          'You have already joined this classroom. Cannot accept the invitation again.',
        );
      }
    }

    invitation.status = status;
    invitation.respondedAt = new Date();

    if (status === 'accepted') {
      // Create enrollment
      const candidateClassroom = this.candidateClassroomRepository.create({
        classroomId: invitation.classroomId,
        candidateId,
        candidateEmail,
        status: 'active',
      });

      await this.candidateClassroomRepository.save(candidateClassroom);
      console.log(`✅ Enrollment created for ${candidateEmail}`);

      // Update classroom stats
      const classroom = await this.classroomRepository.findOne({
        where: { id: invitation.classroomId },
      });

      if (classroom) {
        classroom.acceptedCount = (classroom.acceptedCount || 0) + 1;
        classroom.pendingCount = Math.max((classroom.pendingCount || 1) - 1, 0);
        classroom.studentCount = (classroom.studentCount || 0) + 1;
        await this.classroomRepository.save(classroom);
        console.log(`✅ Classroom stats updated`);
      }
    }

    const savedInvitation = await this.invitationRepository.save(invitation);
    console.log(`✅ Invitation saved with status: ${savedInvitation.status}`);
    
    return savedInvitation;
  }

  async getCandidateClassrooms(candidateId: string): Promise<TeacherClassroom[]> {
    const enrollments = await this.candidateClassroomRepository.find({
      where: { candidateId, status: 'active' },
      relations: ['classroom'],
    });

    return enrollments.map((e) => e.classroom);
  }

  async getClassroomEnrollments(
    teacherId: string,
    classroomId: string,
  ): Promise<CandidateClassroom[]> {
    await this.getClassroomDetail(teacherId, classroomId); // Verify access

    return this.candidateClassroomRepository.find({
      where: { classroomId, status: 'active' },
      relations: ['candidate'],
      order: { enrolledAt: 'DESC' },
    });
  }

  // ==================== UTILITIES ====================

  private generateClassCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
