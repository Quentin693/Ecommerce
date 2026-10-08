import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateCarDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsEnum(['supercar', 'luxury', 'suv', 'convertible'])
  category: 'supercar' | 'luxury' | 'suv' | 'convertible';

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsEnum(['automatic', 'manual'])
  transmission?: 'automatic' | 'manual';
}
