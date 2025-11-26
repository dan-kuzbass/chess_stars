import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from '../lessons/lesson.entity';
import { LessonParticipant } from '../lessons/lesson-participant.entity';

export enum UserRole {
  TRAINER = 'trainer',
  STUDENT = 'student',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({
    type: 'text',
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'text',
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ type: 'json', nullable: true })
  preferences?: any; // Пользовательские настройки

  @Column({ type: 'json', nullable: true })
  stats?: any; // Статистика (рейтинг, количество занятий и т.д.)

  // Связь тренер-ученик: у ученика может быть выбранный тренер
  @ManyToOne(() => User, (user) => user.students, { nullable: true })
  @JoinColumn({ name: 'trainerId' })
  trainer?: User;

  @Column({ nullable: true })
  trainerId?: string;

  // У тренера может быть много учеников
  @OneToMany(() => User, (user) => user.trainer)
  students?: User[];

  // Для тренеров - занятия, которые они ведут
  @OneToMany(() => Lesson, (lesson) => lesson.trainer)
  trainedLessons?: Lesson[];

  // Для учеников - занятия, в которых они участвуют
  @OneToMany(() => LessonParticipant, (participant) => participant.user)
  lessonParticipations?: LessonParticipant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
