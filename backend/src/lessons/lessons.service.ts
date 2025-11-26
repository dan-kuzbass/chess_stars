import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson, LessonStatus, LessonType } from './lesson.entity';
import {
  LessonParticipant,
  ParticipantStatus,
} from './lesson-participant.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonParticipant)
    private participantRepository: Repository<LessonParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createLesson(
    createLessonDto: CreateLessonDto,
    trainerId: string,
  ): Promise<Lesson> {
    const trainer = await this.userRepository.findOne({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    if (trainer.role !== UserRole.TRAINER && trainer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only trainers can create lessons');
    }

    // Создаем урок
    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      scheduledAt: new Date(createLessonDto.scheduledAt),
      trainer,
      roomId: this.generateRoomId(),
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    // Добавляем участников
    for (const participantId of createLessonDto.participantIds) {
      const participant = await this.userRepository.findOne({
        where: { id: participantId },
      });

      if (participant) {
        const lessonParticipant = this.participantRepository.create({
          lesson: savedLesson,
          user: participant,
          status: ParticipantStatus.INVITED,
        });
        await this.participantRepository.save(lessonParticipant);
      }
    }

    return this.findOne(savedLesson.id);
  }

  async findAll(userId: string, role: UserRole): Promise<Lesson[]> {
    if (role === UserRole.TRAINER || role === UserRole.ADMIN) {
      return this.lessonRepository.find({
        where: { trainer: { id: userId } },
        relations: ['trainer', 'participants', 'participants.user'],
        order: { scheduledAt: 'DESC' },
      });
    } else {
      return this.lessonRepository.find({
        where: {
          participants: {
            user: { id: userId },
          },
        },
        relations: ['trainer', 'participants', 'participants.user'],
        order: { scheduledAt: 'DESC' },
      });
    }
  }

  async findTrainerActiveLessons(
    trainerId: string,
    studentId: string,
  ): Promise<Lesson[]> {
    // Find lessons created by the trainer that are scheduled or in progress
    const scheduledLessons = await this.lessonRepository.find({
      where: {
        trainer: { id: trainerId },
        status: LessonStatus.SCHEDULED,
      },
      relations: ['trainer', 'participants', 'participants.user'],
    });

    const inProgressLessons = await this.lessonRepository.find({
      where: {
        trainer: { id: trainerId },
        status: LessonStatus.IN_PROGRESS,
      },
      relations: ['trainer', 'participants', 'participants.user'],
    });

    const allActiveLessons = [...scheduledLessons, ...inProgressLessons];

    // Filter out lessons where the student is already a participant
    return allActiveLessons
      .filter(
        (lesson) =>
          !lesson.participants.some(
            (participant) => participant.user.id === studentId,
          ),
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['trainer', 'participants', 'participants.user'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async updateLesson(
    id: string,
    updateLessonDto: UpdateLessonDto,
    userId: string,
  ): Promise<Lesson> {
    const lesson = await this.findOne(id);

    // Только тренер может обновлять урок
    if (lesson.trainer.id !== userId) {
      throw new ForbiddenException('Only the trainer can update this lesson');
    }

    if (updateLessonDto.scheduledAt) {
      updateLessonDto.scheduledAt = new Date(
        updateLessonDto.scheduledAt,
      ) as any;
    }

    await this.lessonRepository.update(id, updateLessonDto);
    return this.findOne(id);
  }

  async joinLesson(lessonId: string, userId: string): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    if (
      lesson.status !== LessonStatus.SCHEDULED &&
      lesson.status !== LessonStatus.IN_PROGRESS
    ) {
      throw new ForbiddenException('Cannot join this lesson');
    }

    let participant = lesson.participants.find((p) => p.user.id === userId);

    if (!participant) {
      // Check if the user is a student of this trainer
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['trainer'],
      });

      if (user && user.trainer && user.trainer.id === lesson.trainer.id) {
        // Student is allowed to join their trainer's lesson
        // Add them as a participant
        const lessonParticipant = this.participantRepository.create({
          lesson: lesson,
          user: user,
          status: ParticipantStatus.ATTENDED,
          joinedAt: new Date(),
        });
        await this.participantRepository.save(lessonParticipant);
        participant = lessonParticipant;
      } else {
        throw new ForbiddenException('You are not invited to this lesson');
      }
    } else if (!participant.joinedAt) {
      await this.participantRepository.update(participant.id, {
        joinedAt: new Date(),
        status: ParticipantStatus.ATTENDED,
      });
    }

    return this.findOne(lessonId);
  }

  async leaveLesson(lessonId: string, userId: string): Promise<void> {
    const lesson = await this.findOne(lessonId);

    const participant = lesson.participants.find((p) => p.user.id === userId);

    if (participant && participant.joinedAt && !participant.leftAt) {
      await this.participantRepository.update(participant.id, {
        leftAt: new Date(),
      });
    }
  }

  async startLesson(lessonId: string, trainerId: string): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    if (lesson.trainer.id !== trainerId) {
      throw new ForbiddenException('Only the trainer can start this lesson');
    }

    await this.lessonRepository.update(lessonId, {
      status: LessonStatus.IN_PROGRESS,
    });

    return this.findOne(lessonId);
  }

  async endLesson(lessonId: string, trainerId: string): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    if (lesson.trainer.id !== trainerId) {
      throw new ForbiddenException('Only the trainer can end this lesson');
    }

    await this.lessonRepository.update(lessonId, {
      status: LessonStatus.COMPLETED,
    });

    return this.findOne(lessonId);
  }

  async updateGameState(
    lessonId: string,
    gameState: any,
    userId: string,
  ): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    // Только тренер или участники могут обновлять состояние игры
    const canUpdate =
      lesson.trainer.id === userId ||
      lesson.participants.some((p) => p.user.id === userId);

    if (!canUpdate) {
      throw new ForbiddenException(
        'You cannot update the game state for this lesson',
      );
    }

    await this.lessonRepository.update(lessonId, { gameState });
    return this.findOne(lessonId);
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
