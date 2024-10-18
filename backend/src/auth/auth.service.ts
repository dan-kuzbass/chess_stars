import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      this.usersService.createUser(username, pass);
      return {
        access_token: await this.jwtService.signAsync({ username }),
      };
    }
    try {
      const isValidPassword = await bcrypt.compare(pass, user?.passwordHash);
      if (!isValidPassword) {
        throw new BadRequestException('Неверный пароль');
      }
      const payload = { username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException();
    }
  }
}
