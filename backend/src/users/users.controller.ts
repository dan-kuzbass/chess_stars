import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('trainers')
  getAllTrainers() {
    return this.usersService.getAllTrainers();
  }

  @Get('my-students')
  getMyStudents(@Request() req: any) {
    if (req.user.role !== UserRole.TRAINER) {
      throw new Error('Only trainers can access this endpoint');
    }
    return this.usersService.getMyStudents(req.user.userId);
  }

  @Get('students-without-trainer')
  getStudentsWithoutTrainer() {
    return this.usersService.getStudentsWithoutTrainer();
  }

  @Post('assign-trainer')
  assignTrainer(@Body() body: { trainerId: string }, @Request() req: any) {
    if (req.user.role !== UserRole.STUDENT) {
      throw new Error('Only students can assign trainers');
    }
    return this.usersService.assignTrainer(req.user.userId, body.trainerId);
  }

  @Delete('remove-trainer')
  removeTrainer(@Request() req: any) {
    if (req.user.role !== UserRole.STUDENT) {
      throw new Error('Only students can remove trainers');
    }
    return this.usersService.removeTrainer(req.user.userId);
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    const { passwordHash, ...profile } = user;

    // Если это ученик, добавляем информацию о тренере
    if (user.role === UserRole.STUDENT && user.trainerId) {
      const trainer = await this.usersService.findById(user.trainerId);
      if (trainer) {
        const { passwordHash, ...trainerInfo } = trainer;
        return {
          ...profile,
          trainer: trainerInfo,
        };
      }
    }

    // Если это тренер, добавляем список учеников
    if (user.role === UserRole.TRAINER) {
      const students = await this.usersService.getMyStudents(user.id);
      return {
        ...profile,
        students,
      };
    }

    return profile;
  }

  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateData: { firstName?: string; lastName?: string },
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(
        req.user.userId,
        updateData,
      );
      const { passwordHash, ...profile } = updatedUser;
      return profile;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }
}
