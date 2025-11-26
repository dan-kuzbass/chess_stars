import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';
import { LessonStatus } from '../lesson.entity';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @IsOptional()
  roomId?: string;

  @IsOptional()
  gameState?: any;

  @IsOptional()
  recordingData?: any;
}
