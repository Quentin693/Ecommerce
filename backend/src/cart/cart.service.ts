import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CarsService } from '../cars/cars.service';
import { BookingsService } from '../bookings/bookings.service';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { rentalDays } from '../bookings/rental-days';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private carsService: CarsService,
    private bookingsService: BookingsService,
    private dataSource: DataSource,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return {
      items: items.map((item) => this.presentItem(item)),
      total: items.reduce((sum, item) => sum + this.lineTotal(item), 0),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const car = await this.carsService.findOne(dto.carId);
    if (!car.available) {
      throw new BadRequestException('This car is not available');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const overlap = await this.bookingsService.hasDateOverlap(
      dto.carId,
      startDate,
      endDate,
    );
    if (overlap) {
      throw new BadRequestException(
        'This car is already booked for the selected dates',
      );
    }

    const existing = await this.cartRepository.findOne({
      where: { userId, carId: dto.carId },
    });
    if (existing) {
      existing.startDate = startDate;
      existing.endDate = endDate;
      existing.notes = dto.notes ?? existing.notes;
      existing.deliveryAddress =
        dto.deliveryAddress ?? existing.deliveryAddress;
      existing.deliveryCity = dto.deliveryCity ?? existing.deliveryCity;
      await this.cartRepository.save(existing);
      return this.presentItem(await this.reloadItem(existing.id));
    }

    const item = this.cartRepository.create({
      userId,
      carId: dto.carId,
      startDate,
      endDate,
      notes: dto.notes,
      deliveryAddress: dto.deliveryAddress,
      deliveryCity: dto.deliveryCity,
    });
    const saved = await this.cartRepository.save(item);
    return this.presentItem(await this.reloadItem(saved.id));
  }

  private async reloadItem(id: string): Promise<CartItem> {
    const item = await this.cartRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    return item;
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.remove(item);
    return { deleted: true };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const items = await this.cartRepository.find({ where: { userId } });
    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const results: {
      booking: Booking;
      payment: Payment;
      confirmationUrl: string;
    }[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const car = await this.carsService.findOne(item.carId);
        if (!car.available) {
          throw new BadRequestException(`${car.name} is not available`);
        }

        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const overlap = await this.bookingsService.hasDateOverlap(
          item.carId,
          startDate,
          endDate,
        );
        if (overlap) {
          throw new BadRequestException(
            `${car.name} is already booked for the selected dates`,
          );
        }

        const totalPrice =
          rentalDays(startDate, endDate) * Number(car.pricePerDay);

        const booking = manager.create(Booking, {
          userId,
          carId: item.carId,
          startDate,
          endDate,
          totalPrice,
          notes: dto.notes ?? item.notes,
          deliveryAddress: dto.deliveryAddress ?? item.deliveryAddress,
          deliveryCity: dto.deliveryCity ?? item.deliveryCity,
          deliveryStatus: 'to_schedule',
          status: 'confirmed',
        });
        const savedBooking = await manager.save(booking);

        const payment = manager.create(Payment, {
          bookingId: savedBooking.id,
          amount: totalPrice,
          currency: 'EUR',
          status: 'succeeded',
          provider: 'mock',
          paidAt: new Date(),
        });
        const savedPayment = await manager.save(payment);

        await manager.remove(item);

        const fullBooking = await manager.findOne(Booking, {
          where: { id: savedBooking.id },
          relations: ['user', 'car'],
        });
        if (fullBooking?.user) {
          const { password, ...safeUser } = fullBooking.user;
          void password;
          fullBooking.user = safeUser as Booking['user'];
        }

        results.push({
          booking: fullBooking as Booking,
          payment: savedPayment,
          confirmationUrl: `/confirmation/${savedBooking.id}`,
        });
      }
    });

    return {
      message: 'Paiement confirmé. Votre réservation est validée sur le site.',
      orders: results,
    };
  }

  private lineTotal(item: CartItem): number {
    const days = rentalDays(new Date(item.startDate), new Date(item.endDate));
    return days * Number(item.car?.pricePerDay ?? 0);
  }

  private presentItem(item: CartItem) {
    if (item.user) {
      const { password, ...safeUser } = item.user;
      void password;
      item.user = safeUser as CartItem['user'];
    }
    return {
      ...item,
      lineTotal: this.lineTotal(item),
      days: rentalDays(new Date(item.startDate), new Date(item.endDate)),
    };
  }
}
