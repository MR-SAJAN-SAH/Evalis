import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  // Contact Information
  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  personalEmail: string;

  // Personal Information
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  fullName: string; // Full name of the user

  @Column({ nullable: true })
  gender: string; // Male, Female, Other

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  profileUrl: string;

  // Academic Information
  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  rollNumber: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  admissionBatch: string;

  @Column({ nullable: true })
  currentSemester: string;

  @Column({ default: false })
  graduated: boolean;

  @Column({ nullable: true })
  cgpa: string;

  // Additional Information
  @Column({ nullable: true })
  scholarship: string;

  @Column({ nullable: true })
  portfolioLink: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  // Parent Information
  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
