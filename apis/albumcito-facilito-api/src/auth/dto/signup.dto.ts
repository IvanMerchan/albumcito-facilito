import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  name: string;
}
