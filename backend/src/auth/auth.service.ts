import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string, role?: UserRole): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      console.log(
        'Creating new user:',
        username,
        'with role:',
        role || UserRole.STUDENT,
      );
      const newUser = await this.usersService.createUser(
        username,
        pass,
        role || UserRole.STUDENT,
      );
      const payload = {
        username: newUser.username,
        userId: newUser.id,
        role: newUser.role,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      };
    }
    try {
      const isValidPassword = await bcrypt.compare(pass, user?.passwordHash);
      if (!isValidPassword) {
        throw new BadRequestException('Неверный пароль');
      }
      const payload = {
        username: user.username,
        userId: user.id,
        role: user.role,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException();
    }
  }
}
