import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'node:path';
import { validateEnv, type Env } from './config/env.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', { infer: true }),
          transport:
            config.get('NODE_ENV', { infer: true }) === 'development'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
    // ส่งไฟล์หน้าเว็บที่ Vite build ไว้ ทุก path ที่ไม่ใช่ /api ตอบ index.html
    ServeStaticModule.forRoot({
      rootPath: join(import.meta.dirname, '..', '..', 'web', 'dist'),
      exclude: ['/api/{*path}'],
    }),
    PrismaModule,
    HealthModule,
    OrdersModule,
    JobsModule,
  ],
})
export class AppModule {}
