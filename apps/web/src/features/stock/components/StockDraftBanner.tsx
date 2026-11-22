import { Alert, Badge } from '@mantine/core';

/** Stock module is a proposal pending client decision (Notes item 24) */
export function StockDraftBanner() {
  return (
    <Alert color="orange" variant="light">
      Module นี้เป็นร่างข้อเสนอ · รอยืนยันว่าต้องติดตามสต็อกหรือผลิตตาม Order อย่างเดียว (Q24) และต้องเก็บ
      Lot/วันหมดอายุไหม (Q25){' '}
      <Badge size="xs" variant="outline" color="orange">
        ร่าง
      </Badge>
    </Alert>
  );
}
