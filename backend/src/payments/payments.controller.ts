import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (req.user.role !== 'admin' && payment.booking?.userId !== req.user.id) {
      throw new ForbiddenException();
    }
    if (payment.booking?.user) {
      const { password, ...safeUser } = payment.booking.user;
      void password;
      payment.booking.user = safeUser as typeof payment.booking.user;
    }
    return payment;
  }
}
