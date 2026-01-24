import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Organization } from './organization.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string; // Should be hashed

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.admins)
  subscriptionPlan: SubscriptionPlan;

  @OneToOne(() => Organization, (org) => org.admin)
  organization: Organization;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
