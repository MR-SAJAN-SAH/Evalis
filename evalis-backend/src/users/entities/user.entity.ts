import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Organization } from '../../superadmin/entities/organization.entity';
import { UserProfile } from './user-profile.entity';
import { Role } from './role.entity';

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

  @Column({ nullable: true })
  role: string; // Legacy: Evaluator, Exam Controller, Candidate

  @Column({ nullable: true })
  roleId: string; // New: Foreign key to Role entity

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

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: true })
  roleEntity: Role;

  @OneToOne(() => UserProfile, (profile) => profile.user, { nullable: true, eager: true })
  profile: UserProfile;
}
