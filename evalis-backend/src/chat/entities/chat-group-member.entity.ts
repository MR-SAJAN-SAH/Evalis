import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatGroup } from './chat-group.entity';

@Entity('chat_group_members')
@Unique(['chatGroupId', 'userId'])
export class ChatGroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatGroupId: string;

  @Column()
  userId: string;

  @ManyToOne(() => ChatGroup, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatGroupId' })
  chatGroup: ChatGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 'pending' }) // pending, accepted, rejected
  invitationStatus: string;

  @Column({ nullable: true })
  invitedAt: Date;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ nullable: true })
  lastReadMessageId: string;

  @CreateDateColumn()
  joinedAt: Date;
}
