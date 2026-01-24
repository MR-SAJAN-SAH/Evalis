import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string; // Always in UPPERCASE

  @Column({ type: 'varchar' })
  databaseName: string; // e.g., evalis_organization_name

  @OneToOne(() => Admin, (admin) => admin.organization)
  @JoinColumn()
  admin: Admin;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
