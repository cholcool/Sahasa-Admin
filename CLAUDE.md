# CLAUDE.md — Sahasa Admin

ระบบหลังบ้านจัดการออเดอร์ของบริษัท สหัสสา (เต้าหู้ + น้ำจิ้ม) จาก Shopee, Lazada, TikTok, Line, Facebook, หน้าร้าน และโทรสั่ง
ทีมมี 2 คน คือ **cholcool** และ **poom** ทั้งคู่ใช้ Claude ไฟล์นี้จึงเป็นกติกากลางของทั้งสองฝั่ง

- ตอบผู้ใช้เป็น**ภาษาไทย**
- ก่อนเริ่มงานที่เกี่ยวกับ requirement หรือ database ให้อ่าน `_requirements/Database-Design-Notes.md` ก่อน (เป็นไฟล์หลักของโปรเจกต์) จากนั้นค่อยอ่าน `_requirements/Requirements-Analysis.md` และ prototype หน้าจอ `_requirements/Designs/sahasa-prototype.html`
- ไฟล์ Excel ต้นฉบับอยู่ใน `_requirements/Documents/` และ `_requirements/Marketplace Order/` ซึ่ง**ไม่อยู่ใน git** (มีข้อมูลลูกค้าจริง) ถ้าต้องใช้แต่ไม่มีในเครื่อง ให้บอกผู้ใช้ว่าต้องขอจาก cholcool อย่าเดาข้อมูลเอง
- โครงสร้างโปรเจกต์และคำสั่งทั้งหมดอยู่ใน `README.md`

## Stack (ตัดสินใจแล้ว ห้ามเปลี่ยนเอง)

pnpm monorepo · Node 22 (`nvm use`, เครื่องอาจมี Node 20 เป็นค่าเริ่มต้น ซึ่งรันไม่ได้)

| ส่วน               | ใช้                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/web`        | React 19 + Vite 8, TanStack Router (file-based), TanStack Query, Mantine 9 + mantine-datatable, dayjs |
| `apps/api`        | NestJS 12 (ESM-only), Prisma 7 + `@prisma/adapter-mariadb`, nestjs-pino                               |
| `packages/shared` | zod schema / type / enum ที่ web และ api ใช้ร่วมกัน                                                        |
| Database          | MariaDB ของ Hostinger                                                                                 |
| Test / Lint       | Vitest (ไม่ใช่ Jest), Storybook 10, Oxlint `--type-aware`, Prettier                                     |

**ไม่ใช้**: Next.js, shadcn/ui, Tailwind, Jest, ESLint, Redis/BullMQ, WebSocket, MongoDB
เหตุผลอยู่ใน Notes section 5.1

ข้อจำกัดของ Hostinger shared hosting ที่ต้องออกแบบรองรับ:

- request ต้องจบภายใน **120 วินาที**
- ไม่มี worker process ไม่มี WebSocket ใช้ RAM ร่วมกับเว็บอื่น
- งานเบื้องหลังให้ทำผ่าน `POST /api/jobs/run` ที่ hPanel cron เรียก + ตาราง `jobs`
- ห้ามพึ่ง `@nestjs/schedule` หรือ state ใน memory (process อาจถูก restart) session ต้องเก็บใน MariaDB

## Git

- แต่ละคนทำงานบน branch ของตัวเอง: `cholcool` หรือ `fineart09` (ของ poom) ดู branch ปัจจุบันด้วย `git branch --show-current` ก่อนเริ่ม
- **commit เฉพาะเมื่อผู้ใช้สั่งเท่านั้น** และห้าม push, merge, rebase หรือ force-push เอง
- ห้ามแก้ไขหรือ commit ลง `main` และห้ามแตะ branch ของอีกคน **cholcool เป็นคนเดียวที่ merge เข้า `main`**
- รูปแบบข้อความ commit: `[<app>][<module>]: <สิ่งที่ทำ เป็นภาษาอังกฤษ>`
  - `<app>`: `api` | `web` | `shared` | `root` (config ที่ root) | `docs`
  - `<module>`: ชื่อโมดูลตามตารางใน README เช่น `orders`, `factory`, `auth` (ถ้าไม่เจาะจงโมดูลให้เว้น เช่น `[root]: ...`)
  - ตัวอย่าง: `[api][orders]: add bulk confirm endpoint`, `[web][orders]: fix status filter reset on page change`
- ห้าม commit: `.env`, ไฟล์ Excel / CSV / รูปสลิป (มีชื่อ ที่อยู่ และเบอร์โทรของลูกค้าจริง), `CLAUDE.local.md` ไฟล์ข้อมูลใหม่ให้วางใน `_requirements/Documents/` หรือ `_requirements/Marketplace Order/` เท่านั้น และห้ามแก้ `.gitignore` ให้สองโฟลเดอร์นี้เข้า git

## ต้องถามก่อนทำ

ทั้งสองคนใช้ส่วนเหล่านี้ร่วมกัน จึงต้อง**ถามผู้ใช้และรอคำตอบก่อน**:

- เพิ่ม ลบ หรืออัปเกรด npm package
- แก้ `packages/shared` (schema, enum สถานะ, ช่องทางขาย)
- แก้ `apps/api/prisma/schema.prisma` หรือสร้าง migration
- เปลี่ยน stack, config ที่ root (`.oxlintrc.json`, `tsconfig.base.json`, `pnpm-workspace.yaml`) หรือไฟล์นี้

## โครงสร้างและหลักการเขียนโค้ด

- **แบ่งตามโมดูลธุรกิจ** และใช้ชื่อเดียวกันทั้งสองฝั่ง:
  - API: `apps/api/src/modules/<module>/` (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.spec.ts`)
  - Web: `apps/web/src/features/<module>/` (`api.ts` เป็น query options + `components/`)
  - หน้าจอ: `apps/web/src/routes/_app/<module>/`
- **Controller และ route บาง, service และ feature หนา**: logic ธุรกิจอยู่ใน service ไม่อยู่ใน controller หรือ component ของหน้า
- **ใช้ schema จาก `packages/shared` ทั้งสองฝั่ง**:
  - API ตรวจ input ด้วย `@Body({ schema })` / `@Query({ schema })` (มี `StandardSchemaValidationPipe` ตั้งไว้ใน `main.ts` แล้ว) ไม่ใช้ class-validator
  - หน้าเว็บใช้ schema เดียวกันใน `validateSearch` เพื่อเก็บ filter, หน้า และการเรียงของตารางไว้ใน URL
- **API ESM**: import ต้องลงท้าย `.js` ใช้ `import.meta.dirname` แทน `__dirname` และเขียน test ด้วย `vi.fn()` (ดู `apps/api/AGENTS.md`)
- **Web UI**: ใช้ component ของ Mantine ก่อนเสมอ ใช้สีจาก theme (`brand` = แดง, `gold`) ห้าม hard-code สี style เพิ่มให้เขียนเป็น CSS Module
  - ต้องใช้ได้ทั้ง desktop (sidebar) และมือถือ (bottom nav) และรองรับ dark mode
  - ข้อความที่ผู้ใช้เห็นเป็นภาษาไทย
- **Database**:
  - ตารางและคอลัมน์ใน DB เป็น `snake_case` แต่ใน Prisma/TS เป็น `camelCase` (ใช้ `@@map` / `@map`)
  - เงินใช้ `Decimal(12,2)` + decimal.js ห้ามใช้ float
  - เวลาใช้ `DateTime(3)` เก็บเป็น UTC แสดงผลเป็นเวลาไทยและปี พ.ศ. ด้วย `formatThaiDate()`
  - ห้ามลบจริง ให้ใช้สถานะยกเลิกหรือ soft delete
- **พิมพ์เอกสารภาษาไทย**: ใช้ HTML + CSS `@page` แล้วพิมพ์จาก browser ห้ามใช้ pdf-lib หรือ pdfmake เขียนข้อความไทย (สระและวรรณยุกต์จะเพี้ยน) pdf-lib ใช้แค่รวม PDF ใบปะหน้าของ platform
- **ภาษา**: ชื่อตัวแปร ฟังก์ชัน และ comment ในโค้ดเป็น**ภาษาอังกฤษ** (ข้อความ UI และชื่อ test เป็นภาษาไทยได้)
- **ห้าม import ด้วย `../`** ให้ใช้ alias แทน ส่วนไฟล์ในโฟลเดอร์เดียวกันใช้ `./` ได้
  - `apps/web`: `@/` = `src/` เช่น `import { api } from '@/lib/api-client'` (ตั้งไว้ใน `tsconfig.app.json` และ `vite.config.ts` ถ้าแก้ต้องแก้ทั้งสองที่)
  - `apps/api`: `#src/` = `src/` และต้องมี `.js` เช่น `import { PrismaService } from '#src/prisma/prisma.service.js'` (Node subpath imports ใน `package.json` → `imports` ส่วน test ใช้ alias ใน `vitest.config*.ts`) ใช้ `#/` ไม่ได้เพราะ Node 22 ไม่รองรับ
- อย่าแก้ไฟล์ที่สร้างอัตโนมัติ: `apps/web/src/routeTree.gen.ts`, `apps/api/src/generated/`

## คำสั่ง

```bash
pnpm dev          # api :3000 + web :5173 (รันได้แม้ยังไม่มี DB)
pnpm lint         # Oxlint type-aware
pnpm typecheck
pnpm test         # Vitest ทุก package รวม story test ใน Chromium
pnpm format       # Prettier
pnpm --filter @sahasa/api exec prisma generate
```

## ก่อนบอกว่างานเสร็จ

ต้องรันให้ผ่านทั้ง 3 คำสั่ง: `pnpm lint` → `pnpm typecheck` → `pnpm test`
ถ้ามีอันไหนไม่ผ่าน ให้แก้ก่อน หรือแจ้งผู้ใช้ตรงๆ พร้อม error ห้ามบอกว่าเสร็จ
งานใหม่ที่มี logic ต้องมี test และ component UI ใหม่ที่ใช้ซ้ำได้ควรมี story

## สถานะปัจจุบัน

- ยังไม่มีตารางใน database เพราะรอลูกค้าตอบคำถาม 🔴 ใน Notes section 7 ห้ามออกแบบตารางเองโดยไม่ถาม
- สถานะ order ใน `packages/shared/src/order-status.ts` ยังเป็นร่าง
- โมดูล "สต็อก" ยังไม่ยืนยันว่าจะทำ (ข้อ 24 ใน Notes)
- เรื่องที่ตัดสินใจใหม่ให้บันทึกลง Notes ด้วย ไม่ใช่เก็บไว้ในแชตอย่างเดียว

ตั้งค่าส่วนตัวแต่ละคน (เช่น path ของเครื่อง หรือสไตล์การตอบ) ให้เขียนใน `CLAUDE.local.md` ซึ่งไม่ถูก commit
