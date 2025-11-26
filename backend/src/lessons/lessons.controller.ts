import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
@UseGuards(AuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    return this.lessonsService.createLesson(createLessonDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.lessonsService.findAll(req.user.userId, req.user.role);
  }

  @Get('trainer/:trainerId/active')
  getTrainerActiveLessons(
    @Param('trainerId') trainerId: string,
    @Request() req: any,
  ) {
    return this.lessonsService.findTrainerActiveLessons(
      trainerId,
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.updateLesson(
      id,
      updateLessonDto,
      req.user.userId,
    );
  }

  @Post(':id/join')
  joinLesson(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.joinLesson(id, req.user.userId);
  }

  @Post(':id/leave')
  leaveLesson(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.leaveLesson(id, req.user.userId);
  }

  @Post(':id/start')
  startLesson(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.startLesson(id, req.user.userId);
  }

  @Post(':id/end')
  endLesson(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.endLesson(id, req.user.userId);
  }

  @Put(':id/game-state')
  updateGameState(
    @Param('id') id: string,
    @Body('gameState') gameState: any,
    @Request() req: any,
  ) {
    return this.lessonsService.updateGameState(id, gameState, req.user.userId);
  }
}
