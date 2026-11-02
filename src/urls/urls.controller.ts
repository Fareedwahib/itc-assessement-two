import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-url.dto';
import { UrlsService } from './urls.service';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  async createShortLink(@Body() dto: CreateShortUrlDto) {
    return this.urlsService.createShortLink(dto.originalUrl);
  }

  @Get(':shortCode')
  async getOriginalUrl(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const payload = await this.urlsService.getOriginalUrl(shortCode);
    return res.redirect(payload.originalUrl);
  }

  @Get(':shortCode/stats')
  async getStats(@Param('shortCode') shortCode: string) {
    return this.urlsService.getStats(shortCode);
  }
}