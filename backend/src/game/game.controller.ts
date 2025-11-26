import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const game = this.gameService.findOne(id);
    if (!game) {
      throw new BadRequestException('Игра с таким id не найдена');
    }
    return this.gameService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('edit')
  signIn(@Body() gameDto: any) {
    if (!gameDto?.fen || !gameDto?.id) {
      throw new BadRequestException('Неверный формат игры');
    }
    return this.gameService.changeGame(gameDto);
  }
}
