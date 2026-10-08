import { IsIn } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status: BookingStatus;
}
