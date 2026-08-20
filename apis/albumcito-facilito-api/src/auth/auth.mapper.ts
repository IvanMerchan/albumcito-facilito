import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

export function toUserDto(user: User): UserDto {
  return plainToInstance(
    UserDto,
    {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
    { excludeExtraneousValues: true },
  );
}

export function toAuthResponseDto(
  user: User,
  accessToken: string,
): AuthResponseDto {
  return plainToInstance(
    AuthResponseDto,
    {
      accessToken,
      user: toUserDto(user),
    },
    { excludeExtraneousValues: true },
  );
}
