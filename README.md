# URL Shortener API

A production-oriented URL shortening backend built with NestJS, TypeScript, PostgreSQL, and Redis.

This service allows users to shorten long URLs, redirect via short codes, and track usage statistics. It is designed to be simple to run locally while demonstrating clean architecture, caching, and scalable backend patterns.

## Highlights

- Shorten long URLs into unique alphanumeric codes
- Redirect short links to their original destination
- Track per-link visit counts
- Expose link statistics endpoint
- Cache URL mappings and stats with Redis to reduce database load
- Persist link data with PostgreSQL and TypeORM
- Validate input payloads with DTO constraints

## Tech Stack

- Framework: NestJS (Node.js)
- Language: TypeScript
- ORM: TypeORM
- Database: PostgreSQL
- Cache: Redis (ioredis)
- Testing: Jest (unit and e2e)
- Lint/Format: ESLint + Prettier

## API Endpoints

Base URL (local): `http://localhost:3000`

1. Health/Welcome
- `GET /`
- Returns a basic hello response.

2. Create short URL
- `POST /urls/shorten`
- Request body:

```json
{
  "originalUrl": "https://example.com/some/long/path"
}
```

- Success response example:

```json
{
  "shortCode": "a1B2c3D",
  "shortUrl": "http://localhost:3000/a1B2c3D",
  "originalUrl": "https://example.com/some/long/path"
}
```

3. Redirect using short code
- `GET /urls/:shortCode`
- Behavior: increments visit count and redirects to the original URL.

4. Get short link statistics
- `GET /urls/:shortCode/stats`
- Response example:

```json
{
  "shortCode": "a1B2c3D",
  "originalUrl": "https://example.com/some/long/path",
  "visitCount": 12,
  "createdAt": "2026-11-03T18:00:00.000Z"
}
```

## Project Structure

```text
src/
  app.module.ts
  main.ts
  config/
    configuration.ts
  redis/
    redis.module.ts
    redis.service.ts
  urls/
    urls.module.ts
    urls.controller.ts
    urls.service.ts
    dto/
      create-url.dto.ts
    entities/
      url.entity.ts
  common/
    utils/
      url.util.ts
```

## Environment Variables

Create a `.env` file in the project root.

```env
# App
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=url_shortener
DATABASE_SYNCHRONIZE=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

Notes:
- `DATABASE_SYNCHRONIZE=true` is convenient for local development.
- For production, set `DATABASE_SYNCHRONIZE=false` and use migrations.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL running locally or remotely
- Redis running locally or remotely

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Build and Run Production Mode

```bash
npm run build
npm run start:prod
```

## Available Scripts

- `npm run start` - Start application
- `npm run start:dev` - Start in watch mode
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build TypeScript to `dist`
- `npm run lint` - Run ESLint with autofix
- `npm run format` - Format source and test files
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Generate coverage report

## Caching Strategy

Redis is used to reduce repeated reads and speed up response times:

- URL lookup cache: stores mappings from original URL to short payload
- Short code cache: stores mappings from short code to original URL
- Stats cache: stores short-lived stats responses

If Redis is temporarily unavailable, the service continues operating with database fallback.

## Data Model

The `urls` table stores:

- `id` (primary key)
- `shortCode` (unique, indexed)
- `originalUrl`
- `visitCount`
- `createdAt`

## Example cURL Requests

Create short URL:

```bash
curl -X POST http://localhost:3000/urls/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/article/123"}'
```

Get stats:

```bash
curl http://localhost:3000/urls/a1B2c3D/stats
```

Redirect (follow manually in browser):

```bash
curl -i http://localhost:3000/urls/a1B2c3D
```

## Future Improvements

- Add custom aliases for short codes
- Add URL expiration and soft delete
- Add rate limiting and request throttling middleware
- Add Swagger/OpenAPI documentation
- Add analytics breakdown by date and referrer
- Introduce database migrations for production workflows

## License

This project is for assessment and portfolio demonstration purposes.
