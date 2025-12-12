import { Module } from '@nestjs/common';
import { SubscriptionTypesController } from './subscription-types.controller';
import { SubscriptionTypesService } from './subscription-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionTypesController],
  providers: [SubscriptionTypesService],
  exports: [SubscriptionTypesService],
})
export class SubscriptionTypesModule {}
