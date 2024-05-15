import { IsString, MinLength } from 'class-validator';

export class UpdateCurrentUserPasswordDTO {
  @IsString()
  readonly currentPassword: string;

  @IsString()
  @MinLength(8)
  readonly newPassword: string;

  @IsString()
  readonly confirmPassword: string;
}
