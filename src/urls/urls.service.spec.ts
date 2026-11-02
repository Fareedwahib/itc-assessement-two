import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../redis/redis.service';
import { Url } from './entities/url.entity';
import { UrlsService } from './urls.service';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let redis: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    redis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: repository,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
  });

  it('should create a short link for a valid URL', async () => {
    repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    repository.create.mockReturnValue({ shortCode: 'abc1234', originalUrl: 'https://example.com' });
    repository.save.mockResolvedValue({ shortCode: 'abc1234', originalUrl: 'https://example.com', visitCount: 0 });

    const result = await service.createShortLink('https://example.com');

    expect(result.originalUrl).toBe('https://example.com');
    expect(result.shortCode).toMatch(/^[A-Za-z0-9]{7}$/);
    expect(redis.set).toHaveBeenCalled();
  });
});
