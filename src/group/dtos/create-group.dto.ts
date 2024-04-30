import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateGroupDTO {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsBoolean()
  readonly isPublic: boolean;
}
