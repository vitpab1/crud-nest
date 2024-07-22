import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  id: string;

  @IsString()
  name: string;
  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @IsOptional()
  priority?: number;
}
