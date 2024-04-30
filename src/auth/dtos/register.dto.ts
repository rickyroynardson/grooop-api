import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;

  @IsString()
  readonly password: string;
}
