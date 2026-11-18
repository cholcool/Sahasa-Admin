import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { Env } from '#src/config/env.js';

/** ให้เฉพาะ hPanel cron ที่ส่ง header x-cron-secret ถูกต้องเรียก endpoint ได้ */
@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService<Env, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const given = Buffer.from(String(req.headers['x-cron-secret'] ?? ''));
    const expected = Buffer.from(this.config.get('CRON_SECRET', { infer: true }));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
