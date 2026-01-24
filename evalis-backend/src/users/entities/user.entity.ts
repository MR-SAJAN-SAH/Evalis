import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Organization } from '../../superadmin/entities/organization.entity';
import { UserProfile } from './user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // Evaluator, Exam Controller, Candidate

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.users)
  organization: Organization;

  @Column()
  organizationId: string;

  @OneToOne(() => UserProfile, (profile) => profile.user, { nullable: true, eager: true })
  profile: UserProfile;
}
