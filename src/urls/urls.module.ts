import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { Url } from './entities/url.entity';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), RedisModule],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {}