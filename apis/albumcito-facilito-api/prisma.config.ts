import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer reads the datasource URL from schema.prisma; the CLI
// (migrate/generate) reads it from here instead. The PrismaClient used by
// the app at runtime is configured separately in src/prisma/prisma.service.ts
// via a driver adapter, since Prisma 7 requires one for direct connections.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
