import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CronSecretGuard } from '#src/common/guards/cron-secret.guard.js';

/**
 * hPanel cron เรียกทุก 5 นาที:
 *   curl -s -X POST -H "x-cron-secret: $CRON_SECRET" https://<domain>/api/jobs/run
 * ต้องจบงานภายใน 120 วินาที (request timeout ของ Hostinger) งานที่เหลือให้รอรอบถัดไป
 */
@Controller('jobs')
@UseGuards(CronSecretGuard)
export class JobsController {
  @Post('run')
  @HttpCode(200)
  run() {
    // TODO: ดึงงานจากตาราง jobs (sync order, ประมวลผล webhook, retry) ตามลำดับ next_retry_at
    return { processed: 0 };
  }
}
