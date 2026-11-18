import { StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '#src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'mysql://test:test@localhost:3306/test';
    process.env.CRON_SECRET ??= 'test-secret-at-least-16';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/orders ใช้ค่า default จาก shared schema', () => {
    return request(app.getHttpServer())
      .get('/api/orders?page=2')
      .expect(200)
      .expect((res) => expect(res.body).toMatchObject({ page: 2, pageSize: 50 }));
  });

  it('GET /api/orders ปฏิเสธสถานะที่ไม่มีในระบบ', () => {
    return request(app.getHttpServer()).get('/api/orders?status=lost').expect(400);
  });

  it('POST /api/jobs/run ต้องมี x-cron-secret', () => {
    return request(app.getHttpServer()).post('/api/jobs/run').expect(401);
  });
});
