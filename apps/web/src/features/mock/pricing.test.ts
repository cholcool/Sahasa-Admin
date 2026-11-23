import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRICE_RULES as P,
  DEFAULT_SHIPPING_RULES as S,
  minOrderQty,
  regionOf,
  SAUCE_ID,
  shippingFee,
  TOFU_ID,
  unitPrice,
} from './pricing';

const tofu = (channel: Parameters<typeof unitPrice>[2], qty: number) =>
  unitPrice(P, TOFU_ID, channel, qty);

describe('ราคาเต้าหู้ตาม Project Detail › ราคาสินค้า', () => {
  it('Lazada 45 บาท/ชิ้น ทุกจำนวน', () => {
    expect(tofu('lazada', 1)).toBe(45);
    expect(tofu('lazada', 50)).toBe(45);
  });

  it('Shopee: 10 ชิ้น 35 · 20–30 ชิ้น 30 · 40 ขึ้นไป 28', () => {
    expect(tofu('shopee', 10)).toBe(35);
    expect(tofu('shopee', 20)).toBe(30);
    expect(tofu('shopee', 35)).toBe(30);
    expect(tofu('shopee', 40)).toBe(28);
  });

  it('Line/Facebook (และโทร/หน้าร้าน): 10 ชิ้น 35 · 20–30 ชิ้น 28 · 40 ขึ้นไป 25', () => {
    expect(tofu('line', 10)).toBe(35);
    expect(tofu('facebook', 30)).toBe(28);
    expect(tofu('phone', 40)).toBe(25);
    expect(tofu('storefront', 100)).toBe(25);
  });

  it('TikTok 35 ทุกจำนวนตั้งแต่ 10 ชิ้น', () => {
    expect(tofu('tiktok', 10)).toBe(35);
    expect(tofu('tiktok', 60)).toBe(35);
  });

  it('สั่งขั้นต่ำ 10 ชิ้นยกเว้น Lazada', () => {
    expect(minOrderQty(P, TOFU_ID, 'shopee')).toBe(10);
    expect(minOrderQty(P, TOFU_ID, 'line')).toBe(10);
    expect(minOrderQty(P, TOFU_ID, 'lazada')).toBe(1);
  });

  it('ลูกค้าราคาพิเศษใช้ราคากลุ่มแทนขั้นบันได', () => {
    expect(unitPrice(P, TOFU_ID, 'line', 10, 'franchise')).toBe(24);
    expect(unitPrice(P, TOFU_ID, 'line', 10, 'wholesale_a')).toBe(23);
    expect(unitPrice(P, TOFU_ID, 'phone', 10, 'wholesale_b')).toBe(22);
    expect(unitPrice(P, TOFU_ID, 'line', 500, 'jfb')).toBe(16);
  });

  it('น้ำจิ้ม 75 บาท/ชุด ทุกช่องทาง', () => {
    expect(unitPrice(P, SAUCE_ID, 'shopee', 1)).toBe(75);
    expect(unitPrice(P, SAUCE_ID, 'line', 3, 'franchise')).toBe(75);
  });
});

const fee = (
  channel: Parameters<typeof unitPrice>[2],
  address: string,
  productIds = [TOFU_ID],
  pickUp = false,
) => shippingFee(S, { channel, address, productIds, pickUp }).fee;

describe('ค่าขนส่งเรียกเก็บ', () => {
  const south = 'ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110';
  const bkk = 'แขวงบางนา เขตบางนา กรุงเทพฯ 10260';
  const north = 'ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300';

  it('แยกภาคจากที่อยู่', () => {
    expect(regionOf(south)).toBe('bkk_south');
    expect(regionOf(bkk)).toBe('bkk_south');
    expect(regionOf(north)).toBe('other');
  });

  it('Line/Facebook/Lazada: กทม./ใต้ 50 · ภาคอื่น 100', () => {
    expect(fee('line', south)).toBe(50);
    expect(fee('lazada', bkk)).toBe(50);
    expect(fee('facebook', north)).toBe(100);
  });

  it('Shopee/TikTok 150 บาท', () => {
    expect(fee('shopee', south)).toBe(150);
    expect(fee('tiktok', north)).toBe(150);
  });

  it('สั่งน้ำจิ้มอย่างเดียว 30 บาท', () => {
    expect(fee('shopee', north, [SAUCE_ID])).toBe(30);
    expect(fee('line', south, [SAUCE_ID])).toBe(30);
  });

  it('หน้าร้าน / รับที่ร้าน ไม่คิดค่าส่ง', () => {
    expect(fee('storefront', south)).toBe(0);
    expect(fee('line', south, [TOFU_ID], true)).toBe(0);
  });
});
