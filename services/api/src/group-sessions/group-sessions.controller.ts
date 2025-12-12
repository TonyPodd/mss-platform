import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GroupSessionsService } from './group-sessions.service';
import { GenerateSessionsDto } from './dto/generate-sessions.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('group-sessions')
export class GroupSessionsController {
  constructor(private readonly groupSessionsService: GroupSessionsService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async generateSessions(@Body() dto: GenerateSessionsDto) {
    return this.groupSessionsService.generateSessions(dto);
  }

  @Get('group/:groupId/upcoming')
  async getUpcomingSessions(@Param('groupId') groupId: string) {
    return this.groupSessionsService.getUpcomingSessions(groupId);
  }

  @Get(':id')
  async getSessionById(@Param('id') id: string) {
    return this.groupSessionsService.getSessionById(id);
  }

  @Get()
  async getAllSessions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.groupSessionsService.getAllSessions(start, end);
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getSessionParticipants(@Param('id') id: string) {
    return this.groupSessionsService.getSessionParticipants(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async cancelSession(@Param('id') id: string, @Body() dto: CancelSessionDto) {
    return this.groupSessionsService.cancelSession(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteSession(@Param('id') id: string) {
    return this.groupSessionsService.deleteSession(id);
  }
}
