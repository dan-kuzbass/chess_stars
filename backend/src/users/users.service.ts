import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

const bcrypt = require('bcrypt');

export type User = {
  userId: UUID;
  username: string;
  passwordHash: string;
};

@Injectable()
export class UsersService {
  private users = [];

  async createUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    console.log('fdfd BCRYPT_ROUNDS_COUNT', +process.env.BCRYPT_ROUNDS_COUNT);
    const newPasswordHash = await bcrypt.hash(
      password,
      +process.env.BCRYPT_ROUNDS_COUNT,
    );
    if (newPasswordHash) {
      const newUser = {
        userId: crypto.randomUUID(),
        username,
        passwordHash: newPasswordHash,
      };
      this.users.push(newUser);
      const { passwordHash, ...returnedUser } = newUser;
      console.log('fdfd passwordHash', passwordHash);
      console.log('fdfd returnedUser', returnedUser);
      return returnedUser;
    }
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
