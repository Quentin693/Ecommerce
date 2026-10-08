import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Booking,
  BookingStatus,
  DeliveryStatus,
} from './entities/booking.entity';
import { CarsService } from '../cars/cars.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { rentalDays } from './rental-days';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private carsService: CarsService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking> {
    const car = await this.carsService.findOne(createBookingDto.carId);

    if (!car.available) {
      throw new BadRequestException('This car is not available');
    }

    const startDate = new Date(createBookingDto.startDate);
    const endDate = new Date(createBookingDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const overlap = await this.hasDateOverlap(
      createBookingDto.carId,
      startDate,
      endDate,
    );
    if (overlap) {
      throw new BadRequestException(
        'This car is already booked for the selected dates',
      );
    }

    const totalPrice = rentalDays(startDate, endDate) * Number(car.pricePerDay);

    const booking = this.bookingsRepository.create({
      userId,
      carId: createBookingDto.carId,
      startDate,
      endDate,
      totalPrice,
      notes: createBookingDto.notes,
      deliveryAddress: createBookingDto.deliveryAddress,
      deliveryCity: createBookingDto.deliveryCity,
      deliveryStatus: 'to_schedule',
      status: 'pending',
    });

    return this.present(await this.bookingsRepository.save(booking));
  }

  async findMyBookings(userId: string): Promise<Booking[]> {
    const bookings = await this.bookingsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return bookings.map((booking) => this.present(booking));
  }

  async findOne(id: string, userId?: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    if (userId && booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this booking',
      );
    }

    return this.present(booking);
  }

  async cancel(id: string, userId: string): Promise<Booking> {
    const booking = await this.findOne(id, userId);

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = 'cancelled';
    return this.present(await this.bookingsRepository.save(booking));
  }

  async findAllAdmin(): Promise<Booking[]> {
    const bookings = await this.bookingsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return bookings.map((booking) => this.present(booking));
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = status;
    return this.present(await this.bookingsRepository.save(booking));
  }

  async updateDelivery(id: string, dto: UpdateDeliveryDto): Promise<Booking> {
    const booking = await this.findOne(id);
    if (dto.deliveryStatus) {
      booking.deliveryStatus = dto.deliveryStatus as DeliveryStatus;
    }
    if (dto.deliveryAddress !== undefined) {
      booking.deliveryAddress = dto.deliveryAddress;
    }
    if (dto.deliveryCity !== undefined) {
      booking.deliveryCity = dto.deliveryCity;
    }
    return this.present(await this.bookingsRepository.save(booking));
  }

  async hasDateOverlap(
    carId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const query = this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.carId = :carId', { carId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed'],
      })
      .andWhere('booking.startDate < :endDate', { endDate })
      .andWhere('booking.endDate > :startDate', { startDate });

    if (excludeBookingId) {
      query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  private present(booking: Booking): Booking {
    if (booking.user) {
      const { password, ...safeUser } = booking.user;
      void password;
      booking.user = safeUser as Booking['user'];
    }
    return booking;
  }
}
