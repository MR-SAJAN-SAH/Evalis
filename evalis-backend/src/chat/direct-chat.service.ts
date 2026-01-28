import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';
import { CreateChatMessageDto, UpdateChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class DirectChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getOrCreateDirectChat(userId: string, otherUserId: string, organizationId: string): Promise<Chat> {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const otherUser = await this.userRepository.findOne({ where: { id: otherUserId } });

    if (!user || !otherUser) {
      throw new NotFoundException('User not found');
    }

    // Check if both users are in the same organization
    if (user.organizationId !== organizationId || otherUser.organizationId !== organizationId) {
      throw new ForbiddenException('Users must be in the same organization');
    }

    // Find existing chat between these two users
    let chat = await this.chatRepository.findOne({
      where: [
        { user1Id: userId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: userId },
      ],
    });

    // Create new chat if doesn't exist
    if (!chat) {
      chat = this.chatRepository.create({
        user1Id: userId,
        user2Id: otherUserId,
        organizationId,
      });
      await this.chatRepository.save(chat);
    }

    return chat;
  }

  async getDirectChats(userId: string, organizationId: string): Promise<Chat[]> {
    const chats = await this.chatRepository.find({
      where: [
        { user1Id: userId, organizationId },
        { user2Id: userId, organizationId },
      ],
      relations: ['user1', 'user2'],
      order: { lastMessageTime: 'DESC' },
    });

    return chats;
  }

  async getDirectChatMessages(chatId: string, userId: string, skip: number = 0, take: number = 50): Promise<ChatMessage[]> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify user is part of this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    const messages = await this.messageRepository.find({
      where: { chatId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return messages.reverse();
  }

  async sendDirectMessage(chatId: string, userId: string, dto: CreateChatMessageDto): Promise<ChatMessage> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify user is part of this chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    // Check if the other user hasn't blocked this user
    const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
    const isBlocked = chat.user1Id === userId ? chat.user2Blocked : chat.user1Blocked;
    
    if (isBlocked) {
      throw new ForbiddenException('You are blocked by this user');
    }

    const message = this.messageRepository.create({
      chatId,
      senderId: userId,
      content: dto.content,
      messageType: dto.messageType || 'text',
      fileUrl: dto.fileUrl,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update last message in chat
    chat.lastMessageId = savedMessage.id;
    chat.lastMessageTime = new Date();
    await this.chatRepository.save(chat);

    const result = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    return result || savedMessage;
  }

  async editMessage(messageId: string, userId: string, dto: UpdateChatMessageDto): Promise<ChatMessage> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = dto.content;
    message.editedAt = new Date();
    await this.messageRepository.save(message);

    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    const messages = await this.messageRepository.find({
      where: { chatId },
    });

    for (const message of messages) {
      if (message.senderId !== userId && !message.readByUserIds.includes(userId)) {
        message.readByUserIds = [...message.readByUserIds, userId];
        await this.messageRepository.save(message);
      }
    }
  }

  async archiveChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id === userId) {
      chat.user1Archived = true;
    } else if (chat.user2Id === userId) {
      chat.user2Archived = true;
    } else {
      throw new ForbiddenException('You are not part of this chat');
    }

    await this.chatRepository.save(chat);
  }

  async blockUser(chatId: string, userId: string, blockUserId: string): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id === userId && chat.user2Id === blockUserId) {
      chat.user1Blocked = true;
    } else if (chat.user2Id === userId && chat.user1Id === blockUserId) {
      chat.user2Blocked = true;
    } else {
      throw new ForbiddenException('Invalid chat participants');
    }

    await this.chatRepository.save(chat);
  }

  async searchChatMessages(chatId: string, userId: string, searchQuery: string): Promise<ChatMessage[]> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this chat');
    }

    return this.messageRepository
      .createQueryBuilder('msg')
      .where('msg.chatId = :chatId', { chatId })
      .andWhere('msg.content ILIKE :query', { query: `%${searchQuery}%` })
      .orderBy('msg.createdAt', 'DESC')
      .getMany();
  }
}
