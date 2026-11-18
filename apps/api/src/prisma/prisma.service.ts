import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '#src/generated/prisma/client.js';
import type { Env } from '#src/config/env.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    // Hostinger shared: จำกัด connection ไว้น้อยๆ เพราะใช้ทรัพยากรร่วมกับเว็บอื่น
    const adapter = new PrismaMariaDb(config.get('DATABASE_URL', { infer: true }));
    super({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
