import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../superadmin/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, { eager: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  action: string; // e.g., 'Created exam', 'Updated user', 'Failed login'

  @Column()
  entityType: string; // e.g., 'Exam', 'User', 'Authentication', 'Settings'

  @Column({ nullable: true })
  entityName: string; // e.g., 'Java Programming', 'John Doe'

  @Column({ nullable: true })
  entityId: string; // ID of the affected resource

  @Column('enum', {
    enum: ['success', 'failure', 'warning'],
    default: 'success',
  })
  status: 'success' | 'failure' | 'warning';

  @Column({ type: 'text', nullable: true })
  details: string; // Additional details about the action

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
