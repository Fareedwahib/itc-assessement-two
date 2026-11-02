import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { Url } from './entities/url.entity';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly redisService: RedisService,
  ) {}

  async createShortLink(originalUrl: string) {
    const cleanUrl = originalUrl.trim();
    const urlCacheKey = `url:${cleanUrl}`;
    const cachedUrl = await this.redisService.get<{
      shortCode: string;
      shortUrl: string;
      originalUrl: string;
    }>(urlCacheKey);

    if (cachedUrl) {
      return cachedUrl;
    }

    const existing = await this.urlRepository.findOne({
      where: { originalUrl: cleanUrl },
    });

    if (existing) {
      const response = {
        shortCode: existing.shortCode,
        shortUrl: `${this.getBaseUrl()}/${existing.shortCode}`,
        originalUrl: existing.originalUrl,
      };

      await this.redisService.set(urlCacheKey, JSON.stringify(response), 3600);
      return response;
    }

    let shortCode = '';
    let attempts = 0;

    do {
      shortCode = this.generateShortCode();
      attempts += 1;

      if (attempts > 10) {
        throw new Error('Unable to generate a unique short code.');
      }
    } while (await this.urlRepository.findOne({ where: { shortCode } }));

    const saved = await this.urlRepository.save(
      this.urlRepository.create({
        shortCode,
        originalUrl: cleanUrl,
      }),
    );

    const response = {
      shortCode: saved.shortCode,
      shortUrl: `${this.getBaseUrl()}/${saved.shortCode}`,
      originalUrl: saved.originalUrl,
    };

    await this.redisService.set(urlCacheKey, JSON.stringify(response), 3600);
    await this.redisService.set(
      `short:${saved.shortCode}`,
      JSON.stringify({ originalUrl: saved.originalUrl }),
      3600,
    );

    return response;
  }

  async getOriginalUrl(shortCode: string) {
    const shortKey = `short:${shortCode}`;
    const cachedOriginal = await this.redisService.get<{ originalUrl: string }>(shortKey);
    const link = await this.urlRepository.findOne({ where: { shortCode } });

    if (!link) {
      throw new NotFoundException('Short link not found');
    }

    link.visitCount += 1;
    await this.urlRepository.save(link);

    const response = {
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      shortUrl: `${this.getBaseUrl()}/${link.shortCode}`,
      visitCount: link.visitCount,
    };

    if (cachedOriginal?.originalUrl !== link.originalUrl) {
      await this.redisService.set(shortKey, JSON.stringify({ originalUrl: link.originalUrl }), 3600);
    }

    await this.redisService.set(`stats:${shortCode}`, JSON.stringify(response), 30);

    return response;
  }

  async getStats(shortCode: string) {
    const statsCacheKey = `stats:${shortCode}`;
    const cachedStats = await this.redisService.get<{
      shortCode: string;
      originalUrl: string;
      visitCount: number;
      createdAt: Date;
    }>(statsCacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    const link = await this.urlRepository.findOne({
      where: { shortCode },
    });

    if (!link) {
      throw new NotFoundException('Short link not found');
    }

    const response = {
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      visitCount: link.visitCount,
      createdAt: link.createdAt,
    };

    await this.redisService.set(statsCacheKey, JSON.stringify(response), 30);

    return response;
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < 7; i += 1) {
      const index = Math.floor(Math.random() * chars.length);
      result += chars[index];
    }

    return result;
  }

  private getBaseUrl(): string {
    return process.env.BASE_URL ?? 'http://localhost:3000';
  }
}