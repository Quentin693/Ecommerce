import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Payment } from '../payments/entities/payment.entity';
import { CarsModule } from '../cars/cars.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Payment]),
    CarsModule,
    BookingsModule,
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
