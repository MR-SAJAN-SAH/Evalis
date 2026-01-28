import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('papers')
@Index(['organizationId', 'batch'])
@Index(['organizationId', 'roll'])
@Index(['organizationId', 'status'])
export class Paper {
  @PrimaryGeneratedColumn('uuid')
  paperid: string;

  @Column({ type: 'varchar', length: 20 })
  roll: string;

  @Column({ type: 'varchar', length: 100 })
  examname: string;

  @Column({ type: 'bytea' })
  fileData: Buffer;

  @Column({ type: 'integer' })
  fileSize: number;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @CreateDateColumn()
  uploadedDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedTo: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marks: number | null;

  @Column({ type: 'varchar', length: 50 })
  batch: string;

  @Column({ type: 'varchar', length: 100 })
  school: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'varchar', length: 50 })
  semester: string;

  @Column({ type: 'varchar', length: 50 })
  examType: string;

  @Column({ type: 'varchar', length: 50 })
  candidateType: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
