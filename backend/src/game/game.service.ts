import { Injectable } from '@nestjs/common';

interface Game {
  id: string;
  fen: string;
  history: Array<string>;
}

@Injectable()
export class GameService {
  private games = [
    {
      id: '0',
      fen: 'rnbqkbnr/p1pppppp/1p6/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      history: [],
    },
  ];
  findOne(id: string) {
    const game = this.games.find((gameItem) => gameItem.id === id);
    return game;
  }
  changeGame(game: Game) {
    this.games = this.games.map((gameItem) =>
      gameItem.id === game.id
        ? {
            ...gameItem,
            ...game,
          }
        : gameItem,
    );
    console.log(
      'fdfd game',
      this.games.find((gameItem) => gameItem.id === game.id),
    );
    return this.games.find((gameItem) => gameItem.id === game.id);
  }
}
