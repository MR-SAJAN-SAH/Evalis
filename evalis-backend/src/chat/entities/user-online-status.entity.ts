import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_online_status')
export class UserOnlineStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  lastSeenAt: Date;

  @Column({ default: false })
  isTyping: boolean;

  @Column({ nullable: true, type: 'varchar' })
  typingInChatId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;
}
