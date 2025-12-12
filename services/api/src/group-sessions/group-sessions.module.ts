import { Module } from '@nestjs/common';
import { GroupSessionsController } from './group-sessions.controller';
import { GroupSessionsService } from './group-sessions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [GroupSessionsController],
  providers: [GroupSessionsService],
  exports: [GroupSessionsService],
})
export class GroupSessionsModule {}
