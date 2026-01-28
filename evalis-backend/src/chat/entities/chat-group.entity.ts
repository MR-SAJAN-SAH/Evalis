import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../superadmin/entities/organization.entity';
import { ChatGroupMember } from './chat-group-member.entity';

@Entity('chat_groups')
export class ChatGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: 'public' }) // public or private
  visibility: string;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ nullable: true })
  lastMessageTime: Date;

  @Column({ default: 0 })
  memberCount: number;

  @OneToMany(() => ChatGroupMember, (member) => member.chatGroup, { cascade: true })
  members: ChatGroupMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
