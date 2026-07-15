import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const user = await this.usersService.create(email, password, name);
    const token = this.sign(user.id, user.email);
    return { user: this.usersService.sanitize(user), token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    const token = this.sign(user.id, user.email);
    return { user: this.usersService.sanitize(user), token };
  }

  private sign(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }
}
