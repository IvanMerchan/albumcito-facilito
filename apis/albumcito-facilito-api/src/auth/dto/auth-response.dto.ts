import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
