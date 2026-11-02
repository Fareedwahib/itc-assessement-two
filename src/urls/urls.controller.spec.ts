import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: { createShortLink: jest.Mock; getOriginalUrl: jest.Mock; getStats: jest.Mock };

  beforeEach(async () => {
    service = {
      createShortLink: jest.fn(),
      getOriginalUrl: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call shorten service to create a short code', async () => {
    service.createShortLink.mockResolvedValue({ shortCode: 'abc1234', originalUrl: 'https://example.com' });

    const result = await controller.createShortLink({ originalUrl: 'https://example.com' });

    expect(service.createShortLink).toHaveBeenCalledWith('https://example.com');
    expect(result.shortCode).toBe('abc1234');
  });
});
