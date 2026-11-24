import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Master data (channels, products, prices, provinces, roles, …); also runs after `migrate reset`
    seed: 'prisma db execute --file prisma/seed.sql',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
