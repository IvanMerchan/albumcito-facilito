# Tasks: Onboarding — agrega tu primera pegatina

Derivadas de `plan.md`. No empezar a implementar hasta confirmación explícita.

## Fase 0 — Infraestructura: Prisma + SQLite ✅

- [x] Agregar dependencias `prisma` (dev), `@prisma/client` y `@prisma/adapter-libsql` (runtime) al backend.
- [x] `apis/albumcito-facilito-api/prisma/schema.prisma` (modelos `User`, `CollectedSticker`).
- [x] `.env` con `DATABASE_URL="file:./dev.db"` + `.env.example` commiteado + entradas nuevas en `.gitignore`.
- [x] `src/prisma/prisma.service.ts` (`PrismaService`) + `src/prisma/prisma.module.ts` (`@Global()`).
- [x] Scripts `prisma:generate` / `prisma:migrate` en `package.json`; `prisma generate` en `postinstall`.
- [x] Primera migración (`prisma migrate dev --name init`).
- [x] `prisma.config.ts` (Prisma 7 ya no lee la URL desde `schema.prisma`).
- [x] Driver adapter en runtime: `@prisma/adapter-libsql` (Prisma 7 exige un adapter explícito; se prefirió sobre `better-sqlite3` porque no requiere compilación nativa en Windows).
- [x] `src/test-env.setup.ts` + `setupFiles` en ambos jest config + scripts `pretest`/`pretest:e2e` (`cross-env DATABASE_URL=file:./test.db prisma migrate deploy`) para aislar la DB de tests de la de desarrollo.
- [x] Registrar `PrismaModule` en `src/app.module.ts`.

**Desvío respecto al plan original:** Prisma 7 cambió el modelo de conexión — ya no se puede poner `url = env("DATABASE_URL")` en el `datasource` de `schema.prisma`; ahora la URL vive en `prisma.config.ts` (usada solo por el CLI) y el `PrismaClient` en runtime exige un *driver adapter* explícito. Se optó por `@prisma/adapter-libsql` en vez de `@prisma/adapter-better-sqlite3` por la misma razón que se eligió `bcryptjs` sobre `bcrypt`: sin compilación nativa, funciona igual en Windows/CI sin tocar `pnpm-workspace.yaml` más de lo necesario.

## Fase 1 — Migrar `auth` de memoria a Prisma ✅

- [x] `src/auth/entities/user.entity.ts`: re-exporta el tipo `User` generado por Prisma (`export type { User } from '@prisma/client'`) en vez de duplicar la interface a mano.
- [x] Eliminar `src/auth/auth.data.ts` (`USERS` + `resetUsers()`).
- [x] `src/auth/auth.service.ts`: reemplazar accesos a `USERS` por `PrismaService` (`signup`, `validateUser`, `findByUsername`, `findById` — los dos últimos ahora async).
- [x] `src/auth/auth.controller.ts`: `me()` ahora `async` (sigue el cambio de `findById`).
- [x] `src/prisma/reset-database.ts` (`resetDatabase(prisma)`) como estrategia de DB de test — `deleteMany()` de `collectedSticker` y `user` en cada `beforeEach`, usando una `PrismaService` real inyectada en el `TestingModule` (sin mocks, mismo criterio que el resto del proyecto).
- [x] Actualizar `auth.service.spec.ts`, `auth.controller.spec.ts`, `auth.bdd.spec.ts`, `test/auth.e2e-spec.ts` a la nueva estrategia.
- [x] `pnpm lint && pnpm test && pnpm test:e2e` en el backend, todo verde con Prisma (29 tests unit/bdd + 12 e2e).

**Desvío respecto al plan:** SQLite no tolera bien escrituras concurrentes desde los workers en paralelo de Jest — varias test suites abriendo su propia conexión al mismo `test.db` a la vez producían `Operation has timed out` en `deleteMany()`. Se resolvió agregando `--runInBand` a `test`/`test:cov`/`test:e2e` (Jest corre los archivos de test en serie, un solo proceso). Efecto colateral positivo: la suite corre más rápido (~15s vs ~40s) al no pagar el arranque de workers.

## Fase 2 — Backend: módulo `collection` ✅

- [x] `AlbumsService.findStickerById(stickerId)` en `src/albums/albums.service.ts` (+ 2 casos de test en `albums.service.spec.ts`). Devuelve `{ album, sticker }`, no solo el `Sticker`, para que el mapper de colección no tenga que resolverlo dos veces.
- [x] `src/collection/collection.service.ts` (`addSticker` idempotente vía `findUnique` + `create`, marca `onboardingCompleted` y loguea el evento de duración solo la primera vez, `findByUser`).
- [x] `src/collection/collection.mapper.ts`.
- [x] `src/collection/dto/add-sticker.dto.ts`.
- [x] `src/collection/dto/collected-sticker.dto.ts`.
- [x] `src/collection/entities/collected-sticker.entity.ts` (re-exporta el tipo `CollectedSticker` de Prisma, mismo criterio que `User`).
- [x] `src/collection/collection.controller.ts` (`POST /me/stickers`, `GET /me/stickers`; `@UseGuards(JwtAuthGuard)` a nivel de controller, no por método, porque ambas rutas lo necesitan).
- [x] `src/collection/collection.module.ts` (importa `AuthModule`, `AlbumsModule`).
- [x] Agregar `JwtAuthGuard` a los `exports` de `src/auth/auth.module.ts`.
- [x] Registrar `CollectionModule` en `src/app.module.ts`.
- [x] `src/collection/collection.service.spec.ts` (5 casos), `collection.controller.spec.ts` (2 casos).
- [x] `src/collection/collection.feature` + `src/collection/collection.bdd.spec.ts` (3 escenarios).
- [x] `test/collection.e2e-spec.ts` (4 casos: agregar, 404, 401 sin token, listar).
- [x] `pnpm lint && pnpm test && pnpm test:e2e` en el backend, todo verde (41 unit/bdd + 16 e2e).

**Desvío/gotcha encontrado:** exportar solo `JwtAuthGuard` desde `AuthModule` no bastaba. Nest resuelve `@UseGuards(JwtAuthGuard)` en el contexto de inyección del módulo que lo *usa* (`CollectionModule`), no del que lo declaró — así que `JwtService` (dependencia del guard) también tenía que ser visible ahí. Se resolvió exportando también `JwtModule` desde `AuthModule`. Solo se detectó en el e2e con `AppModule` completo; los unit tests con `TestingModule` no lo atraparon porque llaman a los métodos del controller directamente, sin pasar por el guard.

## Fase 3 — Frontend: flujo de onboarding ✅

- [x] `app/lib/collection.types.ts`.
- [x] `app/lib/collection-api.ts` (`addSticker`, `getMyStickers`).
- [x] `app/actions/collection.ts` (`"use server"`, `addStickerAction`, tomando `stickerId` vía `.bind()` en vez de un segundo parámetro `FormData` sin usar).
- [x] `app/actions/auth.ts`: `signupAction` redirige a `/onboarding` en vez de `/dashboard/${username}`.
- [x] `app/components/onboarding-album-picker.tsx`.
- [x] `app/components/onboarding-sticker-picker.tsx`.
- [x] `app/onboarding/page.tsx` + `loading.tsx` (paso 1, exige sesión).
- [x] `app/onboarding/[albumId]/page.tsx` + `loading.tsx` + `not-found.tsx` (paso 2, exige sesión).
- [x] `app/dashboard/[username]/page.tsx`: muestra evidencia de la colección (`getMyStickers`).
- [x] `npx next typegen` tras crear la ruta `[albumId]` (necesario para que `PageProps<"/onboarding/[albumId]">` resuelva).
- [x] `pnpm lint && pnpm test && pnpm build` en el frontend, todo verde. `/onboarding` y `/onboarding/[albumId]` salen `ƒ` (dinámicas) en el build, `/login`/`/signup` siguen `○` (estáticas).

## Fase 4 — Tests y documentación

- [x] `app/components/onboarding-album-picker.test.tsx` + `onboarding-sticker-picker.test.tsx`.
- [x] `app/onboarding/onboarding.feature` + `.bdd.test.tsx` (prueba el Server Action `addStickerAction` directamente, no la interacción DOM completa — mismo criterio que `signup`/`login`).
- [x] Actualizar `app/signup/signup.feature` + `.bdd.test.tsx` (el redirect ahora es a `/onboarding`, no a `/dashboard/[username]`).
- [x] Actualizar `app/dashboard/[username]/dashboard.test.tsx` con los casos "sin colección todavía" y "tiene una pegatina en su colección".
- [x] Actualizar `CLAUDE.md` raíz, `apis/albumcito-facilito-api/CLAUDE.md`, `apps/albumcito-facilito-app/CLAUDE.md`.
- [x] Verificación manual: signup → onboarding → elegir álbum → elegir pegatina → dashboard con evidencia → **reiniciar el backend** → login (sin onboarding) → dashboard sigue mostrando la pegatina → revisar el log del evento de duración. Los 4 pasos confirmados en navegador real; el log del evento de duración se vio como `{"event":"onboarding_completed","userId":"...","signupAt":"...","completedAt":"...","durationMs":50731}`.

**Bug real encontrado y corregido durante la verificación manual (no relacionado con el código de esta feature):** había un servidor `nest start --watch` de una sesión anterior todavía corriendo en el puerto 3001, con una base de datos SQLite propia que nunca vio los cambios de `CollectionModule` (devolvía 404 en `/me/stickers`, un 404 real de Express por ruta no mapeada, no el `NotFoundException` de la app). Se mató el proceso viejo y se levantó uno nuevo — con eso la verificación pasó limpia. Lección: cuando algo en dev no refleja el código actual, sospechar de un proceso huérfano antes de asumir un bug de la app.

**Desvío:** el archivo de mocks del BDD de onboarding (`onboarding.bdd.test.tsx`) tiene 2 escenarios pero no hace ningún `render()` (prueba el Server Action directamente) — el gotcha de `AfterEachScenario(() => cleanup())` del `CLAUDE.md` del frontend no aplica tal cual porque no hay DOM que limpiar; el problema real era el historial de llamadas del mock `addSticker` filtrándose entre escenarios, resuelto con `AfterEachScenario(() => vi.clearAllMocks())`.
