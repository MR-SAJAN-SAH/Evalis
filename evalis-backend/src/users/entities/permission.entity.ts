import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'users.view', 'exams.create'

  @Column()
  module: string; // e.g., 'Users', 'Exams', 'Analytics'

  @Column()
  action: string; // e.g., 'View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => require('./role.entity').Role, (role) => role.permissions)
  roles: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
