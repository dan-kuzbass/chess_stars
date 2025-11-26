import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Lesson } from './lesson.entity';

export enum ParticipantRole {
  STUDENT = 'student',
  OBSERVER = 'observer',
}

export enum ParticipantStatus {
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  ATTENDED = 'attended',
  ABSENT = 'absent',
}

@Entity()
export class LessonParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.participants, {
    onDelete: 'CASCADE',
  })
  lesson: Lesson;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({
    type: 'text',
    default: ParticipantRole.STUDENT,
  })
  role: ParticipantRole;

  @Column({
    type: 'text',
    default: ParticipantStatus.INVITED,
  })
  status: ParticipantStatus;

  @Column({ type: 'datetime', nullable: true })
  joinedAt?: Date;

  @Column({ type: 'datetime', nullable: true })
  leftAt?: Date;

  @Column({ type: 'json', nullable: true })
  notes?: any; // Заметки тренера об ученике

  @CreateDateColumn()
  createdAt: Date;
}
