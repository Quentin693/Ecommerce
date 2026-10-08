import { IsIn, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../entities/booking.entity';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsIn(['to_schedule', 'scheduled', 'in_transit', 'delivered', 'returned'])
  deliveryStatus?: DeliveryStatus;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryCity?: string;
}
