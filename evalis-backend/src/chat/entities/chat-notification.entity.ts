import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('chat_notifications')
export class ChatNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column() // 'group_invitation', 'group_invite_accepted', 'new_message', 'mention'
  notificationType: string;

  @Column() // chatGroupId, chatId, or messageId depending on type
  relatedId: string;

  @Column({ nullable: true })
  senderId: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ default: false })
  soundEnabled: boolean;

  @Column({ default: false })
  desktopNotificationSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
