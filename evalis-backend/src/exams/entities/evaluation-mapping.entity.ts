import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { Organization } from '../../superadmin/entities/organization.entity';

@Entity('evaluation_mappings')
export class EvaluationMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examId: string;

  @ManyToOne(() => Exam, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  evaluatorEmail: string;

  @Column({ type: 'json' })
  candidateEmails: string[]; // Array of candidate emails mapped to this evaluator

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
