import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  carId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryCity?: string;
}
