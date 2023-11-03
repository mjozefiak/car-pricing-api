import { IsBoolean } from 'class-validator';

export class LogoutDto {
  @IsBoolean()
  global: boolean;
}
