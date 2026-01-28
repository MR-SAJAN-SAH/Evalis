import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatGroupMember } from './entities/chat-group-member.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';
import { CreateChatGroupDto, UpdateChatGroupDto, InviteMembersDto } from './dto/chat-group.dto';
import { ChatNotification } from './entities/chat-notification.entity';

@Injectable()
export class GroupChatService {
  constructor(
    @InjectRepository(ChatGroup)
    private groupRepository: Repository<ChatGroup>,
    @InjectRepository(ChatGroupMember)
    private memberRepository: Repository<ChatGroupMember>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ChatNotification)
    private notificationRepository: Repository<ChatNotification>,
  ) {}

  async createChatGroup(userId: string, organizationId: string, dto: CreateChatGroupDto): Promise<ChatGroup> {
    const creator = await this.userRepository.findOne({ where: { id: userId } });
    if (!creator) {
      throw new NotFoundException('User not found');
    }

    // Only evaluators can create groups
    if (creator.role !== 'Evaluator' && creator.roleEntity?.name !== 'EVALUATOR') {
      throw new ForbiddenException('Only evaluators can create chat groups');
    }

    // Create the group
    const group = this.groupRepository.create({
      name: dto.name,
      description: dto.description,
      creatorId: userId,
      organizationId,
      profilePicture: dto.profilePicture,
      memberCount: 1, // Creator is initial member
    });

    const savedGroup = await this.groupRepository.save(group);

    // Add creator as member
    const creatorMember = this.memberRepository.create({
      chatGroupId: savedGroup.id,
      userId: userId,
      invitationStatus: 'accepted',
      acceptedAt: new Date(),
      joinedAt: new Date(),
    });
    await this.memberRepository.save(creatorMember);

    // Invite initial members
    if (dto.memberIds && dto.memberIds.length > 0) {
      for (const memberId of dto.memberIds) {
        await this.inviteMember(savedGroup.id, userId, memberId, organizationId);
      }
    }

    return savedGroup;
  }

  async getChatGroups(userId: string, organizationId: string): Promise<ChatGroup[]> {
    const groups = await this.groupRepository
      .createQueryBuilder('cg')
      .innerJoin(ChatGroupMember, 'cgm', 'cgm.chatGroupId = cg.id')
      .where('cgm.userId = :userId', { userId })
      .andWhere('cg.organizationId = :organizationId', { organizationId })
      .andWhere('cgm.isActive = true')
      .orderBy('cg.lastMessageTime', 'DESC')
      .getMany();

    return groups;
  }

  async getChatGroupDetails(groupId: string, userId: string): Promise<ChatGroup> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user', 'creator'],
    });

    if (!group) {
      throw new NotFoundException('Chat group not found');
    }

    // Verify user is member of group
    const isMember = group.members.some((m) => m.userId === userId && m.isActive);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async getGroupMessages(groupId: string, userId: string, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    // Verify user is member of group
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const messages = await this.messageRepository.find({
      where: { chatGroupId: groupId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return messages.reverse();
  }

  async sendGroupMessage(groupId: string, userId: string, content: string, messageType: string = 'text'): Promise<ChatMessage> {
    // Verify user is member of group
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const message = this.messageRepository.create({
      chatGroupId: groupId,
      senderId: userId,
      content,
      messageType,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update group last message
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (group) {
      group.lastMessageId = savedMessage.id;
      group.lastMessageTime = new Date();
      await this.groupRepository.save(group);
    }

    const result = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    return result || savedMessage;
  }

  async inviteMember(groupId: string, inviterId: string, memberId: string, organizationId: string): Promise<ChatGroupMember> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Chat group not found');
    }

    // Only group creator can invite
    if (group.creatorId !== inviterId) {
      throw new ForbiddenException('Only group creator can invite members');
    }

    const newMember = await this.userRepository.findOne({ where: { id: memberId } });
    if (!newMember) {
      throw new NotFoundException('Member not found');
    }

    // Check if member is in same organization
    if (newMember.organizationId !== organizationId) {
      throw new ForbiddenException('Member must be in the same organization');
    }

    // Check if already member
    const existingMember = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId: memberId },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    const groupMember = this.memberRepository.create({
      chatGroupId: groupId,
      userId: memberId,
      invitationStatus: 'pending',
      invitedAt: new Date(),
    });

    const savedMember = await this.memberRepository.save(groupMember);

    // Create notification
    const inviter = await this.userRepository.findOne({ where: { id: inviterId } });
    const inviterName = inviter?.name || 'Unknown';

    const notification = this.notificationRepository.create({
      userId: memberId,
      notificationType: 'group_invitation',
      relatedId: groupId,
      senderId: inviterId,
      content: `You have been invited to join "${group.name}" by ${inviterName}`,
      soundEnabled: true,
    });

    await this.notificationRepository.save(notification);

    return savedMember;
  }

  async acceptGroupInvitation(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    member.invitationStatus = 'accepted';
    member.acceptedAt = new Date();
    await this.memberRepository.save(member);

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (group) {
      group.memberCount = await this.memberRepository.count({
        where: { chatGroupId: groupId, isActive: true, invitationStatus: 'accepted' },
      });
      await this.groupRepository.save(group);
    }
  }

  async rejectGroupInvitation(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId },
    });

    if (!member) {
      throw new NotFoundException('Invitation not found');
    }

    await this.memberRepository.remove(member);
  }

  async removeMember(groupId: string, userId: string, removeUserId: string): Promise<void> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Chat group not found');
    }

    // Only creator can remove members
    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only group creator can remove members');
    }

    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId: removeUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in group');
    }

    member.isActive = false;
    await this.memberRepository.save(member);

    group.memberCount = await this.memberRepository.count({
      where: { chatGroupId: groupId, isActive: true, invitationStatus: 'accepted' },
    });
    await this.groupRepository.save(group);
  }

  async updateGroupInfo(groupId: string, userId: string, dto: UpdateChatGroupDto): Promise<ChatGroup> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Chat group not found');
    }

    // Only creator can update
    if (group.creatorId !== userId) {
      throw new ForbiddenException('Only group creator can update group info');
    }

    if (dto.name) group.name = dto.name;
    if (dto.description) group.description = dto.description;
    if (dto.profilePicture) group.profilePicture = dto.profilePicture;

    return this.groupRepository.save(group);
  }

  async searchGroupMessages(groupId: string, userId: string, searchQuery: string): Promise<ChatMessage[]> {
    // Verify user is member of group
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.messageRepository
      .createQueryBuilder('msg')
      .where('msg.chatGroupId = :groupId', { groupId })
      .andWhere('msg.content ILIKE :query', { query: `%${searchQuery}%` })
      .orderBy('msg.createdAt', 'DESC')
      .getMany();
  }

  async muteGroup(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in group');
    }

    member.isMuted = true;
    await this.memberRepository.save(member);
  }

  async unmuteGroup(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { chatGroupId: groupId, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in group');
    }

    member.isMuted = false;
    await this.memberRepository.save(member);
  }
}
