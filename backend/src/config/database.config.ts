import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Lesson } from '../lessons/lesson.entity';
import { LessonParticipant } from '../lessons/lesson-participant.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'chess_stars.db',
  entities: [User, Lesson, LessonParticipant],
  synchronize: true, // В продакшене лучше использовать миграции
  logging: true,
};
