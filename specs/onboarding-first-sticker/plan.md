# Plan: Onboarding — agrega tu primera pegatina

Referencia: `specs/onboarding-first-sticker/spec.md`.

## Resumen técnico

Se introduce el primer concepto de **colección por usuario** y, con él, la primera **persistencia real** del proyecto: Prisma + SQLite. Esto es un cambio de alcance respecto a la primera versión de este plan (que mantenía todo en memoria) — se decidió con el usuario que el campo `onboardingCompleted` y el evento de duración de activación no sirven de nada si se pierden en cada reinicio del backend.

Consecuencia directa: el módulo `auth` (ya commiteado, en memoria) se migra a Prisma en esta misma iniciativa, porque el timestamp de creación de cuenta (`User.createdAt`) y el flag de onboarding (`User.onboardingCompleted`) viven en el propio `User`. `albums` **no** se migra — sigue siendo el seed estático en memoria; `CollectedSticker.stickerId` se guarda como string validado contra ese seed, sin FK real a una tabla de álbumes.

## Fase 0 — Infraestructura: Prisma + SQLite

Nueva para el repo, así que se establece el patrón que seguirá el resto del backend.

- Dependencias: `prisma` (dev), `@prisma/client` (runtime).
- `apis/albumcito-facilito-api/prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  model User {
    id                   String   @id @default(uuid())
    email                String   @unique
    username             String   @unique
    name                 String
    passwordHash         String
    createdAt            DateTime @default(now())
    onboardingCompleted  Boolean  @default(false)
    collectedStickers    CollectedSticker[]
  }

  model CollectedSticker {
    id          String   @id @default(uuid())
    userId      String
    stickerId   String
    collectedAt DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id])

    @@unique([userId, stickerId])
  }
  ```
  `onboardingCompleted` se modela `Boolean @default(false)` (no nullable): la intención original de "nulo por defecto" era distinguir filas creadas antes de que el campo existiera, pero como no hay usuarios previos a esta migración, no hay filas legacy que proteger — `false` como default de columna ya cubre "toda cuenta nueva empieza sin onboarding completado". Documentado como decisión explícita, no como omisión.
- `DATABASE_URL` — sigue el precedente `process.env.X ?? fallback` del resto del proyecto: `.env` con `DATABASE_URL="file:./dev.db"` para desarrollo (nuevo: es el primer `.env` del repo). Agregar `.env` y `apis/albumcito-facilito-api/prisma/*.db` a `.gitignore`; commitear un `.env.example`.
- `src/prisma/prisma.service.ts` — `PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy` (patrón estándar de Nest+Prisma), `src/prisma/prisma.module.ts` (`@Global()`, exporta `PrismaService`) para no tener que importarlo en cada módulo de feature.
- Scripts nuevos en `package.json`: `prisma:generate` (`prisma generate`), `prisma:migrate` (`prisma migrate dev`), y enganchar `prisma generate` a `postinstall` para que `pnpm install` en la raíz deje el client listo.
- Primera migración: `pnpm --filter @albumcito-facilito/api exec prisma migrate dev --name init` (crea `User` y `CollectedSticker`).

## Fase 1 — Migrar `auth` de memoria a Prisma

Cambios sobre código ya commiteado (`src/auth/`):

- `src/auth/entities/user.entity.ts` — agregar `createdAt: Date` y `onboardingCompleted: boolean` a la interface (o, más simple, dejar de mantener una interface manual y usar el tipo `User` generado por Prisma Client directamente — evaluar en implementación cuál mantiene mejor el estilo del resto del proyecto).
- `src/auth/auth.data.ts` (`USERS` array + `resetUsers()`) — **se elimina**. Ya no hay estado de módulo que resetear a mano.
- `src/auth/auth.service.ts` — inyecta `PrismaService`; cada `USERS.find/push` se vuelve una llamada a `this.prisma.user.findUnique/create`:
  - `signup`: `prisma.user.create({ data: { id: randomUUID(), email, username, name, passwordHash } })` (`onboardingCompleted` usa el default `false` de la columna, no hace falta pasarlo explícito, pero se puede dejar explícito por claridad con la intención del negocio).
  - `validateUser`, `findByUsername`, `findById`: `prisma.user.findUnique({ where: ... })`.
  - Duplicado de email: Prisma lanza un error de constraint único (`P2002`) en vez de que el servicio lo chequee a mano primero — decidir en implementación si se mantiene el chequeo explícito previo (más legible, un round-trip extra) o se atrapa el error de Prisma (menos round-trips, manejo de error más acoplado a Prisma). Recomendado: mantener el chequeo explícito por legibilidad, ya que el volumen no lo justifica.
- **Tests** (`auth.service.spec.ts`, `auth.controller.spec.ts`, `auth.bdd.spec.ts`, `test/auth.e2e-spec.ts`) — el `beforeEach` con `resetUsers()` deja de existir; se reemplaza por una base de datos de test real. Enfoque recomendado: SQLite en archivo separado para tests (`DATABASE_URL` distinta vía `.env.test`, o `file::memory:?cache=shared` para que viva solo durante la corrida), con `beforeEach` que hace `prisma.collectedSticker.deleteMany()` + `prisma.user.deleteMany()` para aislar cada test — mismo propósito que `resetUsers()`, ejecutado contra la DB real en vez de un array. Requiere correr `prisma migrate deploy` (o `db push`) contra esa DB de test antes de la suite; agregar un script `pretest`/`pretest:e2e` para eso.

## Fase 2 — Módulo `collection`

Sigue el patrón de referencia de `src/albums/` y `src/auth/` (module/controller/service/dto/entities + `*.spec.ts` + `*.bdd.spec.ts` + e2e), ahora respaldado por Prisma desde el inicio (no hay una versión "en memoria" intermedia).

**Cambio previo en `src/albums/`:**
- `AlbumsService.findStickerById(stickerId: string): Sticker` — recorre `ALBUMS`, `NotFoundException` si no existe. Necesario para validar que un `stickerId` recibido del cliente es real antes de guardarlo (los ids de pegatina son únicos globalmente, ej. `cody-aventuras-01`, así que no hace falta guardar también el `albumId`).

**Nuevo `src/collection/`:**
- `collection.service.ts` (`@Injectable()`, inyecta `PrismaService` y `AlbumsService`):
  - `addSticker(userId: string, stickerId: string)`:
    1. Valida el sticker vía `albumsService.findStickerById(stickerId)`.
    2. `prisma.collectedSticker.upsert(...)` sobre `@@unique([userId, stickerId])` — idempotente por diseño (si ya la tiene, no falla ni duplica).
    3. Si esta llamada creó la **primera** fila de colección de ese usuario (verificar con un `count` antes del upsert, o revisar `user.onboardingCompleted` actual): actualizar `user.onboardingCompleted = true` y calcular/loguear el evento de duración: `durationMs = collectedSticker.collectedAt - user.createdAt`. Log estructurado, ej.: `logger.log({ event: 'onboarding_completed', userId, signupAt: user.createdAt, completedAt: collectedSticker.collectedAt, durationMs })`.
  - `findByUser(userId: string)`.
- `collection.mapper.ts`, `dto/add-sticker.dto.ts`, `dto/collected-sticker.dto.ts` — igual que en la versión anterior del plan (DTO de entrada con `@IsString() @Matches(/^[a-z0-9-]+$/) stickerId`; DTO de salida resuelve el sticker completo vía `AlbumsService` para que el frontend no necesite una segunda llamada).
- `collection.controller.ts` — protegido con `JwtAuthGuard` (de `src/auth/`):
  - `POST /me/stickers` (body `AddStickerDto`) → `CollectedStickerDto`.
  - `GET /me/stickers` → `CollectedStickerDto[]`.
- `collection.module.ts` — importa `AuthModule` (agregar `JwtAuthGuard` a sus `exports`) y `AlbumsModule`. `PrismaModule` es `@Global()`, no hace falta importarlo explícitamente.
- Registrar `CollectionModule` en `src/app.module.ts` (orden alfabético: `AlbumsModule, AuthModule, CollectionModule`).

**Tests:** mismo enfoque de DB de test que en Fase 1 (`deleteMany` en `beforeEach`). Casos: agregar pegatina válida (marca `onboardingCompleted`); `stickerId` inexistente → 404; agregar la misma pegatina dos veces → idempotente, `onboardingCompleted` no se vuelve a togglear ni se duplica el evento de duración.

## Fase 3 — Frontend: flujo de onboarding

Sin cambios respecto a la versión anterior del plan — esta fase es puramente de UI/API contract, no le afecta el cambio de persistencia (el frontend sigue hablando HTTP con el backend igual que antes).

- `app/actions/auth.ts` → `signupAction` redirige a `/onboarding` en vez de `/dashboard/${username}`. `loginAction` no cambia.
- `app/lib/collection.types.ts`, `app/lib/collection-api.ts` (`addSticker` sin `cache()`, `getMyStickers` con `cache()`).
- `app/onboarding/page.tsx` (paso 1: elegir álbum, componente dedicado `onboarding-album-picker.tsx`) y `app/onboarding/[albumId]/page.tsx` (paso 2: elegir pegatina). Ambos exigen sesión (mismo guard que el dashboard).
- `app/actions/collection.ts` (`"use server"`) — `addStickerAction(albumId, stickerId)`: agrega la pegatina, obtiene el username vía `getMe`, `redirect(\`/dashboard/${username}\`)`.
- `app/dashboard/[username]/page.tsx` — agrega `getMyStickers(token)` y muestra evidencia mínima de la colección.

## Fase 4 — Tests y documentación

- Tests de componente para los pickers de onboarding; `.feature` + `.bdd.test.tsx` para el flujo (mismo patrón que `signup`/`login`, probando el Server Action con `next/navigation` mockeado).
- Actualizar `dashboard.test.tsx` con el caso "tiene una pegatina en su colección".
- Actualizar los tres `CLAUDE.md`: nueva sección de persistencia (Prisma + SQLite, ya no "no decidido"), módulo `collection`, migración de `auth`, nuevas rutas frontend, variable de entorno `DATABASE_URL`.
- Verificación manual: signup → onboarding → elegir álbum → elegir pegatina → dashboard con evidencia → **reiniciar el backend** → login (sin pasar por onboarding) → dashboard sigue mostrando la pegatina (a diferencia del plan anterior, este paso ahora sí prueba algo real: que sobrevive un restart) → revisar el log del evento de duración en la consola del backend.

## Riesgos / decisiones abiertas para revisar en la implementación

- Migrar `auth` de memoria a Prisma es un cambio sobre código ya commiteado y con tests ya verdes — implica reescribir su suite de tests con una estrategia de DB de test, no solo agregar código nuevo. Es más trabajo que la versión anterior de este plan, que solo tocaba código nuevo.
- El "obligatorio" del onboarding sigue sin un guard real que bloquee `/dashboard/[username]` si `onboardingCompleted` es `false` — ver spec, sección "Fuera de alcance". El campo queda como dato, no como mecanismo de bloqueo, en esta iteración.
- Estrategia exacta de DB de test (SQLite en archivo vs. `:memory:` compartida vs. reset por `deleteMany`) se decide en implementación; cualquiera de las tres es viable, pero afecta cuánto hay que tocar `jest-e2e.json`/scripts de `package.json`.
- `.env`/`.env.example` y `DATABASE_URL` son la primera configuración de entorno del backend — vale la pena revisar si esto también resuelve (o no) la nota pendiente de `JWT_SECRET` como fallback hardcodeado en `auth.module.ts` (podría moverse a `.env` en el mismo cambio, aunque no es requisito de esta feature).
