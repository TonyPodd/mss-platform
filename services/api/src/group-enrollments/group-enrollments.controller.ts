import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GroupEnrollmentsService } from './group-enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('group-enrollments')
export class GroupEnrollmentsController {
  constructor(private readonly enrollmentsService: GroupEnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getUserEnrollments(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getEnrollmentById(@Param('id') id: string) {
    return this.enrollmentsService.getEnrollmentById(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.cancelEnrollment(id, req.user.id);
  }

  @Patch(':id/pause')
  @UseGuards(JwtAuthGuard)
  async pauseEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.pauseEnrollment(id, req.user.id);
  }

  @Patch(':id/resume')
  @UseGuards(JwtAuthGuard)
  async resumeEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.resumeEnrollment(id, req.user.id);
  }

  @Get('check/:groupId')
  @UseGuards(JwtAuthGuard)
  async checkEnrollment(@Param('groupId') groupId: string, @Request() req) {
    const isEnrolled = await this.enrollmentsService.isUserEnrolled(req.user.id, groupId);
    return { isEnrolled };
  }

  @Get('active/:groupId')
  @UseGuards(JwtAuthGuard)
  async getActiveEnrollment(@Param('groupId') groupId: string, @Request() req) {
    return this.enrollmentsService.getActiveEnrollment(req.user.id, groupId);
  }

  @Get(':enrollmentId/upcoming-sessions')
  @UseGuards(JwtAuthGuard)
  async getUpcomingSessions(@Param('enrollmentId') enrollmentId: string, @Request() req) {
    return this.enrollmentsService.getUpcomingSessions(enrollmentId, req.user.id);
  }
}
