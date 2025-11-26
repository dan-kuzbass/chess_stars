import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { LessonParticipant } from './lesson-participant.entity';

export enum LessonType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
}

export enum LessonStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'text',
    default: LessonType.INDIVIDUAL,
  })
  type: LessonType;

  @Column({
    type: 'text',
    default: LessonStatus.SCHEDULED,
  })
  status: LessonStatus;

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ nullable: true })
  roomId?: string; // Идентификатор виртуальной комнаты

  @Column({ type: 'json', nullable: true })
  gameState?: any; // Состояние шахматной доски

  @Column({ type: 'json', nullable: true })
  recordingData?: any; // Данные записи урока

  @ManyToOne(() => User, { eager: true })
  trainer: User;

  @OneToMany(() => LessonParticipant, (participant) => participant.lesson, {
    eager: true,
  })
  participants: LessonParticipant[];

  @Column({ type: 'json', nullable: true })
  metadata?: any; // Дополнительные данные (настройки, заметки тренера и т.д.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
