import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-type.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('subscription-types')
export class SubscriptionTypesController {
  constructor(private readonly subscriptionTypesService: SubscriptionTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSubscriptionTypeDto) {
    return this.subscriptionTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.subscriptionTypesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.subscriptionTypesService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionTypeDto) {
    return this.subscriptionTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.subscriptionTypesService.remove(id);
  }

  @Post(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.subscriptionTypesService.toggleActive(id);
  }
}
