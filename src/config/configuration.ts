import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional() @IsIn(['development', 'production', 'test']) NODE_ENV?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) PORT?: number;
  @IsOptional() @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
  BASE_URL?: string;
  @IsOptional() @IsInt() @Min(0) TRUST_PROXY?: number;

  @IsOptional() @IsString() @IsNotEmpty() DATABASE_HOST?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) DATABASE_PORT?: number;
  @IsOptional() @IsString() DATABASE_USERNAME?: string;
  @IsOptional() @IsString() DATABASE_PASSWORD?: string;
  @IsOptional() @IsString() @IsNotEmpty() DATABASE_NAME?: string;
  @IsOptional() @IsIn(['true', 'false']) DATABASE_SYNCHRONIZE?: string;

  @IsOptional() @IsString() @IsNotEmpty() REDIS_HOST?: string;
  @IsOptional() @IsInt() @Min(1) @Max(65535) REDIS_PORT?: number;

  @IsOptional() @IsInt() @Min(4) @Max(16) SHORT_CODE_LENGTH?: number;
  @IsOptional() @IsInt() @Min(1) CACHE_TTL_SECONDS?: number;
  @IsOptional() @IsInt() @Min(1) STATS_CACHE_TTL_SECONDS?: number;
  @IsOptional() @IsInt() @Min(1) THROTTLE_TTL_SECONDS?: number;
  @IsOptional() @IsInt() @Min(1) THROTTLE_LIMIT?: number;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const instance = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(instance, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('; ');
    throw new Error(`Invalid environment configuration -> ${details}`);
  }
  return config;
}

const int = (value: string | undefined, fallback: number): number =>
  value === undefined || value === '' ? fallback : parseInt(value, 10);

export default () => {
  const port = int(process.env.PORT, 3000);
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    baseUrl: (process.env.BASE_URL ?? `http://localhost:${port}`).replace(/\/+$/, ''),
    trustProxy: int(process.env.TRUST_PROXY, 0),
    database: {
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: int(process.env.DATABASE_PORT, 5432),
      username: process.env.DATABASE_USERNAME ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
      name: process.env.DATABASE_NAME ?? 'url_shortener',
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: int(process.env.REDIS_PORT, 6379),
    },
    shortCode: { length: int(process.env.SHORT_CODE_LENGTH, 7) },
    cache: {
      urlTtlSeconds: int(process.env.CACHE_TTL_SECONDS, 3600),
      statsTtlSeconds: int(process.env.STATS_CACHE_TTL_SECONDS, 30),
    },
    throttle: {
      ttlMs: int(process.env.THROTTLE_TTL_SECONDS, 60) * 1000,
      limit: int(process.env.THROTTLE_LIMIT, 120),
    },
  };
};
