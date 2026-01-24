import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string; // 'Free Tier', 'Go', 'Advanced'

  @Column({ type: 'integer', default: 0 })
  pricePerYear: number; // 0 for free, 1000 for Go, 5000 for Advanced (in INR)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  features: Record<string, boolean>; // Store features as JSON

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Admin, (admin) => admin.subscriptionPlan)
  admins: Admin[];
}
