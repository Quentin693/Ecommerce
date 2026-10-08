import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual, QueryFailedError } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

export interface CarFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const car = this.carsRepository.create(createCarDto);
    return this.carsRepository.save(car);
  }

  async findAll(filters: CarFilters = {}) {
    const { category, minPrice, maxPrice, available, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (available !== undefined) {
      where.available = available;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.pricePerDay = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.pricePerDay = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.pricePerDay = LessThanOrEqual(maxPrice);
    }

    const options: FindManyOptions<Car> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    const [cars, total] = await this.carsRepository.findAndCount(options);

    return {
      data: cars,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carsRepository.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    await this.findOne(id);
    await this.carsRepository.update(id, updateCarDto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const car = await this.findOne(id);
    try {
      await this.carsRepository.remove(car);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('This car is linked to bookings and cannot be deleted');
      }
      throw error;
    }
  }
}
