import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(email: string, password: string, name?: string): Promise<User> {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');
    const hashed = await bcrypt.hash(password, 12);
    const user = this.usersRepo.create({ email, password: hashed, name });
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async updateProfile(id: string, name: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.name = name;
    return this.usersRepo.save(user);
  }

  /** Strip password before returning to client */
  sanitize(user: User): Omit<User, 'password'> {
    const { password: _pw, ...safe } = user;
    return safe;
  }
}
