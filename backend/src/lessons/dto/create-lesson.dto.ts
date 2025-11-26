import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { LessonType } from '../lesson.entity';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  @Max(480) // максимум 8 часов
  durationMinutes: number;

  @IsArray()
  @IsUUID('all', { each: true })
  participantIds: string[]; // ID участников (учеников тренера)

  @IsOptional()
  metadata?: any;
}
