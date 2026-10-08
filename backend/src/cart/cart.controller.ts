import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('cart')
  getCart(@Request() req: { user: { id: string } }) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('cart/items')
  addItem(
    @Body() dto: AddCartItemDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Delete('cart/items/:id')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Request() req: { user: { id: string } }) {
    return this.cartService.checkout(req.user.id, dto);
  }
}
