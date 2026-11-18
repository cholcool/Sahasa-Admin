# Sahasa Admin

ระบบหลังบ้านจัดการออเดอร์ของบริษัท สหัสสา (เต้าหู้ + น้ำจิ้ม) จากทุกช่องทาง:
Shopee, Lazada, TikTok, Line, Facebook, หน้าร้าน และโทรสั่ง

- เอกสารวิเคราะห์และคำถามค้างตอบ: [Documents/Database-Design-Notes.md](Documents/Database-Design-Notes.md) ← เริ่มอ่านที่นี่
- Prototype หน้าจอ: [Designs/sahasa-prototype.html](Designs/sahasa-prototype.html)

## Tech stack

| ส่วน           | ใช้                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Runtime       | Node 22 (`.nvmrc`), pnpm workspaces                                                                          |
| Frontend      | React 19 + Vite 8, TanStack Router (file-based), TanStack Query, Mantine 9 + mantine-datatable, dayjs (พ.ศ.) |
| Backend       | NestJS 12 (ESM), validation ด้วย zod ผ่าน `StandardSchemaValidationPipe` ของ Nest, nestjs-pino                 |
| Database      | MariaDB (Hostinger) + Prisma 7 + `@prisma/adapter-mariadb`                                                   |
| Test          | Vitest (unit + e2e + story test), Storybook 10                                                               |
| Lint / format | Oxlint (`--type-aware`), Prettier                                                                            |

## โครงสร้างโปรเจกต์

```
Sahasa-Admin/
├── apps/
│   ├── api/                 NestJS — API + ส่งไฟล์หน้าเว็บ (Node app เดียวบน Hostinger)
│   │   ├── prisma/          schema.prisma, migrations/
│   │   ├── src/
│   │   │   ├── main.ts      prefix /api, validation pipe, logger
│   │   │   ├── app.module.ts  รวม module + ServeStaticModule (apps/web/dist)
│   │   │   ├── config/      ตรวจ .env ด้วย zod (แอปไม่ start ถ้าค่าผิด)
│   │   │   ├── prisma/      PrismaService (global)
│   │   │   ├── common/      guard, decorator, filter ที่ใช้ร่วมกัน
│   │   │   ├── modules/     1 โฟลเดอร์ = 1 โมดูลธุรกิจ (ดูด้านล่าง)
│   │   │   └── generated/   Prisma Client (สร้างอัตโนมัติ ไม่ commit)
│   │   └── test/            e2e test (supertest)
│   └── web/                 React + Vite — build เป็นไฟล์ static
│       ├── .storybook/      ตั้ง MantineProvider + theme + สลับ light/dark
│       └── src/
│           ├── main.tsx     จุดเริ่ม: โหลดฟอนต์ / CSS / providers
│           ├── app/         providers, router, query client
│           ├── theme/       theme แดง/ทองตาม prototype
│           ├── routes/      หน้าจอ (file-based route) — บางที่สุด เรียก features
│           ├── features/    1 โฟลเดอร์ = 1 โมดูลธุรกิจ: api.ts (query) + components/
│           ├── components/  UI ที่ใช้ทุกโมดูล เช่น layout
│           └── lib/         api client, dayjs
└── packages/
    └── shared/              zod schema / type / enum ที่หน้าเว็บและ API ใช้ร่วมกัน
```

### หลักการแบ่งโค้ด

1. **แบ่งตามโมดูลธุรกิจ ไม่ใช่ตามชนิดไฟล์** ทั้ง `apps/api/src/modules/<x>` และ `apps/web/src/features/<x>` ใช้ชื่อเดียวกัน ตาม 10 โมดูลใน SRS:

   | โมดูล               | api `modules/`                                  | web `features/` + `routes/`   |
   | ------------------ | ----------------------------------------------- | ----------------------------- |
   | Auth / ผู้ใช้ / สิทธิ์   | `auth`, `users`                                 | `/login`, `/users`            |
   | Dashboard          | `dashboard`                                     | `/`                           |
   | Order              | `orders`, `customers`                           | `/orders`, `/orders/$orderId` |
   | โรงงาน             | `factory`, `shipments`                          | `/factory`                    |
   | บัญชี                | `accounting`                                    | `/accounting`                 |
   | รายงาน             | `reports`                                       | `/reports`                    |
   | เชื่อมต่อ Platform    | `platforms` (shopee, lazada, tiktok), `imports` | `/platforms`                  |
   | ข้อมูลหลัก            | `products`, `master`                            | `/master`                     |
   | สต็อก (รอยืนยันข้อ 24) | `stock`                                         | `/stock`                      |
   | งานเบื้องหลัง         | `jobs` (cron endpoint)                          | —                             |

   ตอนนี้มีจริงแค่ `health`, `orders`, `jobs` ที่เหลือเพิ่มตอนเริ่มทำโมดูลนั้น (`pnpm --filter @sahasa/api exec nest g resource modules/<ชื่อ>`)

2. **schema กลางอยู่ที่ `packages/shared`** เช่น `orderListQuerySchema` ถูกใช้ 2 ที่:
   - หน้าเว็บ: `validateSearch` ของ route `/orders` → filter อยู่ใน URL แบบ type-safe
   - API: `@Query({ schema: orderListQuerySchema })` → ตรวจ query ด้วยกฎเดียวกัน
3. **`routes/` บาง `features/` หนา** หน้าจอแค่ประกอบ component และ query จาก `features/`
   - ไม่ import ด้วย `../../` ให้ใช้ alias แทน:
     - `apps/web`: `@/` = `src/` เช่น `import { formatThaiDate } from '@/lib/dayjs'`
     - `apps/api`: `#src/` = `src/` เช่น `import { PrismaService } from '#src/prisma/prisma.service.js'`
4. **Controller บาง Service หนา** logic ธุรกิจอยู่ใน service เพื่อให้ test ได้ง่าย
5. **เงินใช้ Decimal / เวลาเก็บ UTC** แสดงผลเป็นเวลาไทยและปี พ.ศ. ด้วย `formatThaiDate()`

## เริ่มใช้งาน

```bash
nvm use                                  # Node 22
pnpm install
cp apps/api/.env.example apps/api/.env   # ใส่ DATABASE_URL ของ MariaDB
pnpm --filter @sahasa/shared build
pnpm dev                                 # api :3000 + web :5173 (proxy /api)
```

| คำสั่ง                                 | ทำอะไร                                          |
| ------------------------------------ | ----------------------------------------------- |
| `pnpm dev`                           | รัน api + web พร้อมกัน                             |
| `pnpm build`                         | build shared → web → api                        |
| `pnpm start`                         | รัน production (api ส่งหน้าเว็บจาก `apps/web/dist`) |
| `pnpm test`                          | test ทุก package (รวม story test ใน Chromium)    |
| `pnpm --filter @sahasa/api test:e2e` | e2e test ของ API                                |
| `pnpm lint`                          | Oxlint แบบ type-aware                           |
| `pnpm format`                        | Prettier                                        |
| `pnpm storybook`                     | Storybook ที่ :6006                               |

## Deploy บน Hostinger (ร่าง)

1. build บนเครื่องหรือ GitHub Actions (`pnpm build`) ไม่ build บน Hostinger เพราะ RAM ใช้ร่วมกัน
2. อัปโหลด `apps/api/dist`, `apps/web/dist`, `packages/shared/dist` และ package.json ที่เกี่ยวข้อง
3. hPanel → Node.js: entry `apps/api/dist/main.js`, Node 22, ตั้ง environment variable ตาม `.env.example`
4. hPanel → Cron: ทุก 5 นาที
   `curl -s -X POST -H "x-cron-secret: <CRON_SECRET>" https://<domain>/api/jobs/run`

## สิ่งที่ยังไม่ได้ทำ

- ตาราง database ทั้งหมด (รอลูกค้าตอบคำถาม 🔴)
- Better Auth + session ใน MariaDB, RBAC ด้วย @casl/ability
- Playwright E2E ของทั้งระบบ, Sentry
