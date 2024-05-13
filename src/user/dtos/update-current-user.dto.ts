import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCurrentUserDTO {
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  readonly lastName: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;
}
