import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GroupSessionsModule } from '../group-sessions/group-sessions.module';

@Module({
  imports: [PrismaModule, GroupSessionsModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
