import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryEntry } from './history.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryEntry])],
  providers: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}
