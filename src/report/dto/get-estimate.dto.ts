import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetEstimateDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 15)
  year: number;

  @Transform(({ value }) => parseInt(value))
  @IsLongitude()
  longitude: number;

  @Transform(({ value }) => parseInt(value))
  @IsLatitude()
  latitude: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  course: number;
}
