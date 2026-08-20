import { randomUUID } from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { USERS } from './auth.data';
import { deriveUsername } from './auth.username';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signup(dto: SignupDto): Promise<User> {
    const existing = USERS.find((candidate) => candidate.email === dto.email);
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" is already registered`);
    }

    const username = deriveUsername(
      dto.email,
      USERS.map((user) => user.username),
    );
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user: User = {
      id: randomUUID(),
      email: dto.email,
      username,
      name: dto.name,
      passwordHash,
    };
    USERS.push(user);
    return user;
  }

  async validateUser(dto: LoginDto): Promise<User> {
    const user = USERS.find((candidate) => candidate.email === dto.email);
    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  findByUsername(username: string): User {
    const user = USERS.find((candidate) => candidate.username === username);
    if (!user) {
      throw new NotFoundException(`User "${username}" not found`);
    }
    return user;
  }

  findById(id: string): User {
    const user = USERS.find((candidate) => candidate.id === id);
    if (!user) {
      throw new NotFoundException(`User "${id}" not found`);
    }
    return user;
  }

  signToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });
  }
}
