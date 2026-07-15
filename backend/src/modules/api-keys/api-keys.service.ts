import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ApiKey } from './api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly repo: Repository<ApiKey>,
  ) {}

  private generate(): string {
    return 'dtk_' + randomBytes(24).toString('hex');
  }

  async create(userId: string, label?: string): Promise<ApiKey> {
    const key = this.repo.create({ userId, key: this.generate(), label });
    return this.repo.save(key);
  }

  async listForUser(userId: string): Promise<ApiKey[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async revoke(id: string, userId: string): Promise<void> {
    const key = await this.repo.findOne({ where: { id, userId } });
    if (!key) throw new NotFoundException('API key not found');
    key.active = false;
    await this.repo.save(key);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repo.delete({ id, userId });
  }

  /** Called by API key auth guard to validate a raw key */
  async validate(rawKey: string): Promise<ApiKey | null> {
    const key = await this.repo.findOne({
      where: { key: rawKey, active: true },
      relations: ['user'],
    });
    if (!key) return null;
    key.usageCount++;
    key.lastUsedAt = new Date();
    await this.repo.save(key);
    return key;
  }
}
