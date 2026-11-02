import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { Url } from './urls/entities/url.entity';
import { UrlsModule } from './urls/urls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('DATABASE_NAME', 'url_shortener'),
        entities: [Url],
        synchronize: configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',
        logging: false,
      }),
    }),
    RedisModule,
    UrlsModule,
  ],
})
export class AppModule {}