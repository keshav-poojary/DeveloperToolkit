import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntry } from './history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntry)
    private readonly repo: Repository<HistoryEntry>,
  ) {}

  async save(
    userId: string,
    toolId: string,
    toolName: string,
    input: string,
    output: string,
  ): Promise<HistoryEntry> {
    const entry = this.repo.create({ userId, toolId, toolName, input, output });
    return this.repo.save(entry);
  }

  async getForUser(userId: string, limit = 50): Promise<HistoryEntry[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async deleteEntry(id: string, userId: string): Promise<void> {
    await this.repo.delete({ id, userId });
  }

  async clearUser(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }
}
