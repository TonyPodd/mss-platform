import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('me/subscriptions')
  async getSubscriptions(@Request() req) {
    return this.usersService.getSubscriptions(req.user.id);
  }

  @Get('me/subscriptions/:id')
  async getSubscriptionById(@Request() req, @Param('id') subscriptionId: string) {
    return this.usersService.getSubscriptionById(req.user.id, subscriptionId);
  }

  @Get('me/bookings')
  async getBookingHistory(@Request() req) {
    return this.usersService.getBookingHistory(req.user.id);
  }

  @Get('me/active-subscription')
  async getActiveSubscription(@Request() req) {
    return this.usersService.getActiveSubscription(req.user.id);
  }

  @Get('me/balance')
  async getTotalBalance(@Request() req) {
    return this.usersService.getTotalBalance(req.user.id);
  }

  @Post('me/subscriptions/purchase')
  async purchaseSubscription(
    @Request() req,
    @Body('typeId') typeId: string,
  ) {
    return this.usersService.purchaseSubscription(req.user.id, typeId);
  }
}
