import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chat } from './chat.entity';
import { ChatGroup } from './chat-group.entity';

@Entity('chat_messages')
@Index(['chatId', 'createdAt'])
@Index(['chatGroupId', 'createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  chatId: string;

  @Column({ nullable: true })
  chatGroupId: string;

  @Column()
  senderId: string;

  @Column('text')
  content: string;

  @Column({ default: 'text' }) // text, file, image, voice
  messageType: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  editedAt: Date;

  @Column({ default: false })
  isPinned: boolean;

  @Column('simple-array', { default: '' })
  readByUserIds: string[];

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @ManyToOne(() => ChatGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatGroupId' })
  chatGroup: ChatGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
