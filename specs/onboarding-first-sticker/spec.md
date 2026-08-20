# Spec: Onboarding — agrega tu primera pegatina

## Contexto y motivación

El equipo de negocio quiere mejorar la estrategia de adquisición: que un usuario que se registra tenga una primera acción de valor (agregar una pegatina a un álbum) en la misma sesión del registro, en vez de aterrizar en un dashboard vacío. Es un patrón de activación estándar ("primer momento de valor") para subir la retención de los registros nuevos.

Hoy, tras `POST /auth/signup`, el frontend redirige directo a `/dashboard/[username]`, que no muestra ninguna colección — no existe todavía el concepto de "qué pegatinas tiene cada usuario" (el campo `status` de cada `Sticker` es parte del seed estático de `albums.data.ts`, compartido por todos, no por usuario).

## Objetivo

Que todo usuario que completa el registro (signup), antes de llegar a su dashboard, elija un álbum y marque una pegatina de ese álbum como "la tengo" — quedando registrada como parte de su colección personal.

## Historia de usuario

Como visitante que se acaba de registrar, quiero elegir un álbum y marcar una pegatina como "la tengo" en la misma sesión de registro, para sentir progreso inmediato en la app en vez de llegar a un dashboard vacío.

## Flujo

1. El usuario completa el signup (email, password, name) igual que hoy.
2. En vez de ir directo a `/dashboard/[username]`, aterriza en un paso de onboarding **obligatorio**.
3. Ve el catálogo de álbumes (mismo contenido que la home) y elige uno.
4. Ve las pegatinas de ese álbum y marca **una** como "la tengo".
5. Al confirmar, queda redirigido a `/dashboard/[username]`, que ahora refleja evidencia de esa primera pegatina.
6. El login de un usuario ya existente **no** pasa por este flujo — solo aplica inmediatamente después de un signup.

## Reglas de negocio

- El paso ocurre únicamente entre signup y dashboard. Un `login` normal nunca lo dispara.
- Solo se puede marcar **una** pegatina en este flujo — es un paso de activación mínimo, no la pantalla de "gestionar mi colección completa".
- La pegatina marcada debe pertenecer al álbum que el usuario eligió.
- Si el usuario abandona antes de completar el paso (cierra la pestaña, etc.), la próxima vez que inicie sesión va directo al dashboard — no se le vuelve a forzar el onboarding. El alcance es "en la misma sesión del registro", no un recordatorio persistente.

## Criterios de aceptación

1. Tras completar el signup, el usuario ve la pantalla de onboarding, no el dashboard.
2. Puede navegar el catálogo de álbumes y elegir uno.
3. Puede ver las pegatinas de ese álbum y elegir una como su primera pegatina.
4. Al confirmar, el backend registra que ese usuario posee esa pegatina.
5. El usuario es redirigido a `/dashboard/[username]`, que muestra evidencia de la pegatina obtenida.
6. Un usuario que inicia sesión (login, no signup) nunca ve el onboarding.
7. Si el usuario vuelve a iniciar sesión más tarde, el dashboard sigue reflejando la pegatina que ya había marcado (la colección sobrevive un reinicio del backend).
8. Al crear la cuenta, el usuario queda marcado como "onboarding pendiente" (no completado).
9. Al agregar su primera pegatina, el usuario queda marcado como "onboarding completado", y queda registrado cuánto tiempo pasó entre la creación de la cuenta y ese momento.

## Métrica de activación (para adquisición)

Objetivo de negocio: medir cuánto tarda un usuario nuevo en llegar a su primer "momento de valor" (agregar una pegatina), para poder evaluar y mejorar el flujo de adquisición.

- **Campo de estado:** `User.onboardingCompleted` — booleano, `false` por defecto al crear la cuenta (nulo a nivel de columna, para no asumir un valor en filas que pudieran existir antes de que este campo existiera; en la práctica hoy toda cuenta nueva lo recibe explícitamente en `false` al crearse). Pasa a `true` la primera vez que el usuario agrega una pegatina.
- **Evento de duración:** en el momento exacto en que `onboardingCompleted` pasa a `true`, se calcula `duraciónMs = primeraPegatinaAt - cuentaCreadaAt` y se registra (log estructurado desde el backend). La fuente de verdad de los dos timestamps queda en la base de datos (`User.createdAt` y `CollectedSticker.collectedAt` de la primera pegatina), así el dato no depende de que el log sobreviva.
- Este dato es para reporting/analítica del negocio; no bloquea ni cambia el flujo de UI del usuario.

## Casos borde

- Catálogo de álbumes vacío: no ocurre hoy (el seed siempre tiene datos); se documenta como supuesto, no se maneja explícitamente.
- Usuario navega manualmente a `/dashboard/[username]` sin haber completado el onboarding tras un signup reciente: fuera de alcance bloquear esto con un guard adicional (ver "Fuera de alcance"). El "obligatorio" se logra porque la redirección post-signup apunta al onboarding en vez del dashboard; el campo `onboardingCompleted` queda como dato para reporting, no como mecanismo de bloqueo en esta iteración.

## Fuera de alcance (esta iteración)

- Vista de "mi colección completa" con estado owned/missing/duplicado personalizado en todo el árbol de álbumes/pegatinas ya existente (esas páginas siguen mostrando el seed estático compartido).
- Un guard/middleware que bloquee el acceso a `/dashboard/[username]` mientras `onboardingCompleted` sea `false` — el campo se registra pero no se usa todavía para restringir navegación.
- Forzar a un usuario que abandonó el onboarding a completarlo en un login posterior.
- Permitir marcar más de una pegatina durante el onboarding.
- Deshacer/quitar una pegatina ya marcada.
- Enviar el evento de duración a un servicio de analítica externo (Segment, PostHog, etc.) — por ahora es un log estructurado desde el backend más los timestamps ya guardados en la base de datos.

## Decisiones ya confirmadas con el usuario

- **Selección:** el usuario elige libremente el álbum y la pegatina (no es un álbum/pegatina fijo ni asignado automáticamente).
- **Persistencia:** base de datos real — **Prisma + SQLite**. Reemplaza la decisión inicial de "en memoria": el evento de activación necesita sobrevivir reinicios del backend para servir de métrica de negocio real; una estructura en memoria se pierde en cada reinicio (constante en dev, por el watch mode). Esto implica migrar el módulo `auth` (hoy en memoria) a Prisma también, porque `onboardingCompleted` y `createdAt` viven en `User`.
- **Ubicación en el flujo:** paso obligatorio entre signup y dashboard, no un banner/invitación opcional dentro del dashboard.
- **Estado de onboarding y evento de duración:** campo `onboardingCompleted` en `User` (falso al crear cuenta, verdadero al agregar la primera pegatina) + un evento de duración calculado en el backend en ese mismo momento (ver "Métrica de activación").
