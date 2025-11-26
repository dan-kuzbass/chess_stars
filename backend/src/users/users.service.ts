import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(
    username: string,
    password: string,
    role: UserRole = UserRole.STUDENT,
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      console.log(
        'Creating user with bcrypt',
        password,
        +process.env.BCRYPT_ROUNDS_COUNT || 10,
      );
      const newPasswordHash = await bcrypt.hash(
        password,
        +process.env.BCRYPT_ROUNDS_COUNT || 10,
      );

      if (newPasswordHash) {
        const newUser = this.userRepository.create({
          username,
          passwordHash: newPasswordHash,
          role,
        });

        const savedUser = await this.userRepository.save(newUser);
        const { passwordHash, ...returnedUser } = savedUser;
        console.log('User created successfully:', returnedUser);
        return returnedUser;
      }
    } catch (e) {
      console.error('Error creating user:', e, e?.message);
      throw e;
    }
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateProfile(
    userId: string,
    updateData: { firstName?: string; lastName?: string },
  ): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.findById(userId);
  }

  async getAllTrainers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.TRAINER },
      select: ['id', 'username', 'firstName', 'lastName', 'bio', 'avatar'],
    });
  }

  async getMyStudents(trainerId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { trainerId },
      select: ['id', 'username', 'firstName', 'lastName', 'avatar'],
    });
  }

  async assignTrainer(studentId: string, trainerId: string): Promise<User> {
    await this.userRepository.update(studentId, { trainerId });
    return this.findById(studentId);
  }

  async removeTrainer(studentId: string): Promise<User> {
    await this.userRepository.update(studentId, { trainerId: null });
    return this.findById(studentId);
  }

  async getStudentsWithoutTrainer(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        role: UserRole.STUDENT,
        trainerId: null,
      },
      select: ['id', 'username', 'firstName', 'lastName', 'avatar'],
    });
  }
}
