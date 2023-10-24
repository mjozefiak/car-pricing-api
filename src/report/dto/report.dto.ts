import { Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  brand: string;

  @Expose()
  model: string;

  @Expose()
  price: number;

  @Expose()
  year: number;

  @Expose()
  course: number;

  @Expose()
  longitude: number;

  @Expose()
  latitude: number;

  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: number;
}
