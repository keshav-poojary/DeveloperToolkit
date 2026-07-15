import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('history')
@Index(['userId', 'createdAt'])
export class HistoryEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  toolId: string;

  @Column()
  toolName: string;

  @Column('text', { nullable: true })
  input: string;

  @Column('text', { nullable: true })
  output: string;

  @CreateDateColumn()
  createdAt: Date;
}
