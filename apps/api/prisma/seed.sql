-- Sahasa Admin — master data seed
-- Run: pnpm --filter @sahasa/api db:seed   (also runs after `prisma migrate reset`)
--
-- Safe to run many times: INSERT IGNORE only adds missing rows and never
-- overwrites values that were edited in the app.
-- Sources: "Project Detail.xlsx" › ราคาสินค้าและค่าขนส่ง, ต้องตอบก่อนออกแบบ (Q3, Q6, Q7–9, Q19, Q22, Q26, Q39)
-- Not seeded on purpose (real data, enter in the app): platform_shops, bank_accounts, users.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';

-- ───────── Channels (code = packages/shared CHANNELS) ─────────
INSERT IGNORE INTO channels (code, name, kind, default_billing, show_on_dashboard, sort_order, is_active) VALUES
  ('shopee',     'Shopee',   'marketplace', 'NOVAT', 1, 1, 1),
  ('lazada',     'Lazada',   'marketplace', 'NOVAT', 1, 2, 1),
  ('tiktok',     'TikTok',   'marketplace', 'NOVAT', 1, 3, 1),
  ('line',       'LINE',     'manual',      'NOVAT', 1, 4, 1),
  ('facebook',   'Facebook', 'manual',      'NOVAT', 1, 5, 1),
  ('storefront', 'หน้าร้าน',  'manual',      'NOVAT', 1, 6, 1),
  ('phone',      'โทรสั่ง',   'manual',      'NOVAT', 1, 7, 1);

-- ───────── Products: tofu is sold and priced per ชิ้น, sauce per ชุด ─────────
INSERT IGNORE INTO products (id, code, name, short_name, kind, unit, list_price, sort_order, is_active) VALUES
  (1, 'PRD-001', 'เต้าหู้คลองแงะ',          'เต้าหู้',  'tofu',  'ชิ้น', 45.00, 1, 1),
  (2, 'PRD-002', 'น้ำจิ้มมะขามน้ำตาลโตนด', 'น้ำจิ้ม', 'sauce', 'ชุด',  75.00, 2, 1);

-- ───────── Customer price groups (price sheet rows 7–10) ─────────
INSERT IGNORE INTO price_groups (id, code, name, description, is_active) VALUES
  (1, 'franchise',   'บริษัท แฟรนไชส์ สมิทธ์ จำกัด',             NULL, 1),
  (2, 'wholesale_a', 'ลูกค้าส่ง NoVat (กลุ่ม A)',                  'ราคา 23 บาท/ชิ้น', 1),
  (3, 'wholesale_b', 'ลูกค้าส่ง NoVat (กลุ่ม B)',                  'ราคา 22 บาท/ชิ้น', 1),
  (4, 'jfb',         'บริษัท เจเอฟบี คิทเช่น จำกัด (ชิ้นย่อย)', 'A3: ถ้าโรงงานผลิตชิ้นย่อยแยก ให้แยกเป็นสินค้าใหม่', 1);

-- ───────── Price rules (unit price per ชิ้น / ชุด; highest min_qty reached wins) ─────────
INSERT IGNORE INTO price_rules (id, product_id, price_group_id, min_qty, unit_price, condition_text, effective_from) VALUES
  (1,  1, NULL,  1, 45.00, 'ราคาต่อชิ้น ช่องทาง Lazada',                                   '2026-01-01'),
  (2,  1, NULL, 10, 35.00, 'ราคาเมื่อสั่ง 10 ชิ้น (Line, Facebook, Shopee, TikTok)',        '2026-01-01'),
  (3,  1, NULL, 20, 30.00, 'ราคาเมื่อสั่ง 20-30 ชิ้น (Shopee)',                            '2026-01-01'),
  (4,  1, NULL, 20, 28.00, 'ราคาเมื่อสั่ง 20-30 ชิ้น (Line, Facebook)',                    '2026-01-01'),
  (5,  1, NULL, 40, 28.00, 'ราคาเมื่อสั่ง 40 ชิ้นขึ้นไป (Shopee)',                         '2026-01-01'),
  (6,  1, NULL, 40, 25.00, 'ราคาเมื่อสั่ง 40 ชิ้นขึ้นไป (Line, Facebook)',                 '2026-01-01'),
  (7,  1, 1,     1, 24.00, 'ราคากับ บริษัท แฟรนไชส์ สมิทธ์ จำกัด',                         '2026-01-01'),
  (8,  1, 2,     1, 23.00, 'ราคาลูกค้าส่ง NoVat (กลุ่ม A)',                                '2026-01-01'),
  (9,  1, 3,     1, 22.00, 'ราคาลูกค้าส่ง NoVat (กลุ่ม B)',                                '2026-01-01'),
  (10, 1, 4,     1, 16.00, 'ราคาของ บริษัท เจเอฟบี คิทเช่น จำกัด (แบบชิ้นย่อย)',           '2026-01-01'),
  (11, 2, NULL,  1, 75.00, 'น้ำจิ้ม แบบชุด หรือ แบบกิโลกรัม',                               '2026-01-01');

-- Channel rules only (price-group rules apply to every channel and have no rows here).
-- หน้าร้าน and โทร use the Line/Facebook prices (decided with poom, A2).
INSERT IGNORE INTO price_rule_channels (price_rule_id, channel_code) VALUES
  (1, 'lazada'),
  (2, 'line'), (2, 'facebook'), (2, 'phone'), (2, 'storefront'), (2, 'shopee'), (2, 'tiktok'),
  (3, 'shopee'),
  (4, 'line'), (4, 'facebook'), (4, 'phone'), (4, 'storefront'),
  (5, 'shopee'),
  (6, 'line'), (6, 'facebook'), (6, 'phone'), (6, 'storefront'),
  (11, 'shopee'), (11, 'lazada'), (11, 'tiktok'), (11, 'line'), (11, 'facebook'), (11, 'storefront'), (11, 'phone');

-- ───────── Regions and provinces (Q3: กทม. ปริมณฑล ภาคใต้ = 50, other = 100) ─────────
INSERT IGNORE INTO regions (id, code, name) VALUES
  (1, 'bkk_south', 'กทม. ปริมณฑล และภาคใต้'),
  (2, 'other',     'ภาคเหนือ อีสาน กลาง ตะวันออก ตะวันตก');

INSERT IGNORE INTO provinces (name_th, region_id) VALUES
  ('กรุงเทพมหานคร', 1), ('นนทบุรี', 1), ('ปทุมธานี', 1), ('สมุทรปราการ', 1), ('สมุทรสาคร', 1), ('นครปฐม', 1),
  ('ชุมพร', 1), ('ระนอง', 1), ('สุราษฎร์ธานี', 1), ('พังงา', 1), ('ภูเก็ต', 1), ('กระบี่', 1), ('นครศรีธรรมราช', 1),
  ('ตรัง', 1), ('พัทลุง', 1), ('สตูล', 1), ('สงขลา', 1), ('ปัตตานี', 1), ('ยะลา', 1), ('นราธิวาส', 1),
  ('กาญจนบุรี', 2), ('กาฬสินธุ์', 2), ('กำแพงเพชร', 2), ('ขอนแก่น', 2), ('จันทบุรี', 2), ('ฉะเชิงเทรา', 2),
  ('ชลบุรี', 2), ('ชัยนาท', 2), ('ชัยภูมิ', 2), ('เชียงราย', 2), ('เชียงใหม่', 2), ('ตราด', 2), ('ตาก', 2),
  ('นครนายก', 2), ('นครพนม', 2), ('นครราชสีมา', 2), ('นครสวรรค์', 2), ('น่าน', 2), ('บึงกาฬ', 2), ('บุรีรัมย์', 2),
  ('ประจวบคีรีขันธ์', 2), ('ปราจีนบุรี', 2), ('พระนครศรีอยุธยา', 2), ('พะเยา', 2), ('พิจิตร', 2), ('พิษณุโลก', 2),
  ('เพชรบุรี', 2), ('เพชรบูรณ์', 2), ('แพร่', 2), ('มหาสารคาม', 2), ('มุกดาหาร', 2), ('แม่ฮ่องสอน', 2), ('ยโสธร', 2),
  ('ร้อยเอ็ด', 2), ('ระยอง', 2), ('ราชบุรี', 2), ('ลพบุรี', 2), ('ลำปาง', 2), ('ลำพูน', 2), ('เลย', 2), ('ศรีสะเกษ', 2),
  ('สกลนคร', 2), ('สมุทรสงคราม', 2), ('สระแก้ว', 2), ('สระบุรี', 2), ('สิงห์บุรี', 2), ('สุโขทัย', 2), ('สุพรรณบุรี', 2),
  ('สุรินทร์', 2), ('หนองคาย', 2), ('หนองบัวลำภู', 2), ('อ่างทอง', 2), ('อำนาจเจริญ', 2), ('อุดรธานี', 2),
  ('อุตรดิตถ์', 2), ('อุทัยธานี', 2), ('อุบลราชธานี', 2);

-- ───────── Shipping fee charged to the customer (price sheet rows 12–15) ─────────
INSERT IGNORE INTO shipping_rules (id, name, region_id, sauce_only, fee, effective_from) VALUES
  (1, 'ค่าส่งน้ำจิ้ม (สั่งน้ำจิ้มอย่างเดียว)',                     NULL, 1,  30.00, '2026-01-01'),
  (2, 'ค่าส่ง กทม. ปริมณฑล ภาคใต้ (Line, Facebook, Lazada)',      1,    0,  50.00, '2026-01-01'),
  (3, 'ค่าส่ง ภาคเหนือ อีสาน กลาง (Line, Facebook) — A4: Lazada', 2,    0, 100.00, '2026-01-01'),
  (4, 'ค่าขนส่ง (Shopee, TikTok) — A4: รอยืนยันว่าใครเก็บ',       NULL, 0, 150.00, '2026-01-01');

-- หน้าร้าน has no shipping fee, so it has no shipping rule rows.
INSERT IGNORE INTO shipping_rule_channels (shipping_rule_id, channel_code) VALUES
  (1, 'shopee'), (1, 'lazada'), (1, 'tiktok'), (1, 'line'), (1, 'facebook'), (1, 'phone'),
  (2, 'line'), (2, 'facebook'), (2, 'phone'), (2, 'lazada'),
  (3, 'line'), (3, 'facebook'), (3, 'phone'), (3, 'lazada'),
  (4, 'shopee'), (4, 'tiktok');

-- ───────── Carriers (Q26, Q28) ─────────
INSERT IGNORE INTO carriers (id, code, name, branch_name, has_api, sort_order, is_active) VALUES
  (1, 'inter', 'Inter Express',  'หาดใหญ่', 1, 1, 1),
  (2, 'nim',   'Nim Express',    'กทม.',    1, 2, 1),
  (3, 'fuze',  'Fuze Express',   'กทม.',    1, 3, 1),
  (4, 'store', 'ส่งจากหน้าร้าน', NULL,      0, 4, 1),
  (5, 'van',   'รถตู้/รถทัวร์',  NULL,      0, 5, 1);

-- ───────── Cancel reasons (Q39) ─────────
INSERT IGNORE INTO cancel_reasons (id, name, requires_note, sort_order, is_active) VALUES
  (1, 'ขนส่งส่งสินค้าไม่สำเร็จ',      0, 1, 1),
  (2, 'สินค้าเสียหายหลังลูกค้ารับ', 0, 2, 1),
  (3, 'ติดต่อลูกค้าไม่ได้',           0, 3, 1),
  (4, 'อื่นๆ',                        1, 4, 1);

-- ───────── Settings (Q7–9: open 13:00 the day before, edit until 10:00, ship 12:00, Thai time) ─────────
INSERT IGNORE INTO settings (`key`, value) VALUES
  ('round.open_time',      '"13:00"'),
  ('round.edit_lock_time', '"10:00"'),
  ('round.ship_time',      '"12:00"'),
  ('business.timezone',    '"Asia/Bangkok"'),
  ('vat.rate',             '7'),
  ('document.no_tax_invoice_buyer_name', '"ผู้ซื้อไม่ประสงค์ขอรับใบกำกับภาษี"');

-- ───────── Roles (Q22) — Q41 "หัวหน้า"/"เฉิน" still open ─────────
INSERT IGNORE INTO roles (id, code, name, description, is_system) VALUES
  (1, 'admin',      'Admin',   'ผู้ดูแลระบบ ทำได้ทุกอย่าง', 1),
  (2, 'sales',      'Sales',   'รับและยืนยันออเดอร์ คีย์ข้อมูลส่ง', 1),
  (3, 'head',       'หัวหน้า', 'ดูได้ทุกเมนู อนุมัติและเพิ่มออเดอร์หลังตัดรอบ', 1),
  (4, 'factory',    'โรงงาน',  'ผู้จัดการผลิต รับออเดอร์เข้าผลิตและจัดส่ง', 1),
  (5, 'accounting', 'บัญชี',   'รับเงิน ออกเอกสาร ส่งออก FlowAccount', 1),
  (6, 'owner',      'Owner',   'เจ้าของ ทำได้ทุกอย่าง', 1);

-- ───────── Menus (one row per module; children can be added later) ─────────
INSERT IGNORE INTO menus (id, code, name, parent_id, path, sort_order) VALUES
  (1,  'dashboard', 'แดชบอร์ด',          NULL, '/',          1),
  (2,  'orders',    'ออเดอร์',            NULL, '/orders',    2),
  (3,  'customers', 'ลูกค้า',             NULL, '/customers', 3),
  (4,  'factory',   'โรงงาน',             NULL, '/factory',   4),
  (5,  'shipments', 'การจัดส่ง',          NULL, '/shipments', 5),
  (6,  'payments',  'การรับเงิน',         NULL, '/payments',  6),
  (7,  'accounting','บัญชี',              NULL, '/accounting',7),
  (8,  'reports',   'รายงาน',             NULL, '/reports',   8),
  (9,  'platforms', 'เชื่อมต่อ Platform', NULL, '/platforms', 9),
  (10, 'master',    'ข้อมูลหลัก',         NULL, '/master',    10),
  (11, 'users',     'ผู้ใช้และสิทธิ์',     NULL, '/users',     11),
  (12, 'settings',  'ตั้งค่าระบบ',         NULL, '/settings',  12);

-- ───────── Default permissions (editable in the app; INSERT IGNORE keeps edits) ─────────
-- Columns: view, create, edit, confirm, cancel, add_after_cutoff
INSERT IGNORE INTO role_permissions (role_id, menu_id, can_view, can_create, can_edit, can_confirm, can_cancel, can_add_after_cutoff)
SELECT r.id, m.id,
  -- view
  CASE
    WHEN r.code IN ('admin', 'owner', 'head') THEN 1
    WHEN r.code = 'sales'      AND m.code IN ('dashboard','orders','customers','shipments','payments','reports') THEN 1
    WHEN r.code = 'factory'    AND m.code IN ('dashboard','orders','factory','shipments') THEN 1
    WHEN r.code = 'accounting' AND m.code IN ('dashboard','orders','customers','payments','accounting','reports') THEN 1
    ELSE 0 END,
  -- create
  CASE
    WHEN r.code IN ('admin', 'owner') THEN 1
    WHEN r.code = 'head'       AND m.code IN ('orders','customers','shipments','payments') THEN 1
    WHEN r.code = 'sales'      AND m.code IN ('orders','customers','shipments','payments') THEN 1
    WHEN r.code = 'accounting' AND m.code IN ('payments','accounting') THEN 1
    ELSE 0 END,
  -- edit
  CASE
    WHEN r.code IN ('admin', 'owner') THEN 1
    WHEN r.code = 'head'       AND m.code IN ('orders','customers','factory','shipments','payments') THEN 1
    WHEN r.code = 'sales'      AND m.code IN ('orders','customers','shipments','payments') THEN 1
    WHEN r.code = 'factory'    AND m.code IN ('factory','shipments') THEN 1
    WHEN r.code = 'accounting' AND m.code IN ('payments','accounting') THEN 1
    ELSE 0 END,
  -- confirm
  CASE
    WHEN r.code IN ('admin', 'owner') THEN 1
    WHEN r.code = 'head'       AND m.code IN ('orders','factory','shipments','payments') THEN 1
    WHEN r.code = 'sales'      AND m.code IN ('orders','shipments') THEN 1
    WHEN r.code = 'factory'    AND m.code IN ('factory','shipments') THEN 1
    WHEN r.code = 'accounting' AND m.code IN ('payments','accounting') THEN 1
    ELSE 0 END,
  -- cancel
  CASE
    WHEN r.code IN ('admin', 'owner') THEN 1
    WHEN r.code = 'head'       AND m.code IN ('orders','shipments','payments') THEN 1
    WHEN r.code = 'sales'      AND m.code IN ('orders') THEN 1
    WHEN r.code = 'accounting' AND m.code IN ('payments','accounting') THEN 1
    ELSE 0 END,
  -- add after cutoff
  CASE
    WHEN r.code IN ('admin', 'owner', 'head') AND m.code = 'orders' THEN 1
    ELSE 0 END
FROM roles r
CROSS JOIN menus m
WHERE r.code IN ('admin', 'sales', 'head', 'factory', 'accounting', 'owner');
