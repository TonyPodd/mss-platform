import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { OptionalJwtAuthGuard } from '../auth/optional-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req,
    @Body()
    createBookingDto: {
      eventId?: string;
      groupSessionId?: string;
      participants: Array<{ fullName: string; phone: string; age?: number }>;
      contactEmail: string;
      paymentMethod: 'SUBSCRIPTION' | 'ON_SITE';
      notes?: string;
      subscriptionId?: string;
    },
  ) {
    return this.bookingsService.create({
      ...createBookingDto,
      userId: req.user?.id,
    });
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED',
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
