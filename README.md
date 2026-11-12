# Biblioteca — Frontend

Aplicación web del Trabajo Práctico Integrador de Diseño de Aplicaciones (DAO 2026): sistema de
préstamos interbibliotecarios.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- TanStack Query v5 + Axios
- React Hook Form + Zod
- Lucide React (iconos)

## Requisitos

- Node.js 20.19+ (probado con Node 22)
- Backend de la API corriendo en `http://localhost:8000`

## Puesta en marcha

```bash
npm install
npm run dev
```

Antes de levantar el servidor, creá el archivo de entorno a partir del ejemplo:

```bash
# Linux / macOS
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

La aplicación queda disponible en `http://localhost:5173`. El backend ya permite este origen por
CORS por defecto.

### Variables de entorno

| Variable       | Descripción                | Valor por defecto       |
| -------------- | -------------------------- | ----------------------- |
| `VITE_API_URL` | URL base de la API backend | `http://localhost:8000` |

## Scripts

| Comando                | Descripción                                                |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR                             |
| `npm run build`        | Chequeo de tipos + build de producción                     |
| `npm run typecheck`    | Solo chequeo de tipos                                      |
| `npm run preview`      | Previsualizar el build                                     |
| `npm run lint`         | Lint con Oxlint                                            |
| `npm run format`       | Formatear con Prettier                                     |
| `npm run format:check` | Verificar formato sin modificar archivos                   |
| `npm test`             | Tests de operaciones con Vitest (sin API ni base de datos) |

## Autenticación

- Login contra `POST /auth/token` (form-urlencoded) y perfil con `GET /auth/me`.
- El token JWT se guarda en `localStorage` y se adjunta como `Authorization: Bearer` en cada
  request.
- Ante un `401` se limpia la sesión, la caché de datos y se redirige al login.
- Roles: `ADMIN` (acceso total) y `SOCIO` (catálogo, disponibilidad y sus propios movimientos).
- Usuario inicial del backend: `admin` / `admin1234`.

## Estructura

```text
src/
  api/          Cliente Axios y llamadas a la API
  components/   Layout, guards y componentes de UI reutilizables
  features/     Lógica por dominio (auth, catálogo, administración)
  lib/          Utilidades (storage, errores, query keys, feedback)
  pages/        Vistas de la aplicación (incluye pages/admin)
  types/        Tipos compartidos de la API
```

## Alcance actual

- **M0**: base del proyecto, Tailwind, alias `@`, lint/format.
- **M1**: autenticación, sesión persistente, guards por rol, layout con sidebar/topbar y rutas
  protegidas.
- **M2**: catálogo con filtros, detalle de libro con disponibilidad por sede, consulta de
  disponibilidad, mis préstamos, mis reservas y perfil con cambio de contraseña.
- **M3**: administración de sedes, socios, libros, ejemplares y usuarios (altas, ediciones,
  cambios de estado y bajas según las reglas del backend).
- **M4**: solicitudes y cancelaciones de préstamos/reservas, control de vencimientos,
  generación de remitos, despacho, recepción con estado físico, trazabilidad por número o ID,
  devoluciones con multas y seguimiento de los remitos de retorno.

## Operaciones (M4)

Las pruebas automatizadas de `src/features/operaciones/operaciones.test.ts` cubren identidad
del socio, validación antes del envío, payloads HTTP, errores de negocio, prevención de remitos
duplicados e invalidación de las consultas relacionadas. Usan un adaptador HTTP en memoria;
el recorrido manual de abajo requiere el backend en ejecución.

- **SOCIO**: puede solicitar préstamos y reservas desde el detalle del libro o sus listados.
  Solo puede cancelar préstamos `SOLICITADO` y reservas `ACTIVA`. El socio se toma de la sesión.
- **ADMIN**: registra operaciones para socios habilitados y administra préstamos, reservas,
  remitos y devoluciones. Las rutas están protegidas por rol.
- **Local**: misma sede origen/destino; el backend activa el préstamo y su vencimiento.
- **Interbibliotecario**: `SOLICITADO` → empaquetado → despacho (`EN_TRANSITO`) → recepción
  en buen estado (`ACTIVO`). Un préstamo solicitado se puede cancelar junto con su remito empaquetado.
- **Remitos**: `EMPAQUETADO` permite despachar; `DESPACHADO` permite recibir. La recepción
  registra `BUENO`, `DANADO`, `EXTRAVIADO` o `DESTRUIDO`; el backend determina el resultado.
- **Devoluciones**: solo para préstamos `ACTIVO` o `VENCIDO`. El servidor calcula atraso/multa
  y genera el retorno cuando corresponde; no se crean remitos de retorno manualmente.
- Todas las mutaciones invalidan la caché relacionada (préstamos, reservas, remitos,
  devoluciones, ejemplares, disponibilidad y reportes) antes de completar la operación.

### Recorrido de verificación manual

1. Solicitar un préstamo local y devolverlo; comprobar estado físico, atraso y multa.
2. Solicitar uno interbibliotecario, empaquetarlo, despacharlo y recibirlo en buen estado.
3. Registrar su devolución y despachar/recibir el retorno generado automáticamente.
4. Consultar la trazabilidad por número y verificar el historial de ambas direcciones.
5. Reservar un libro, solicitarlo desde la misma sede y comprobar que la reserva se cumple.
6. Cancelar una solicitud empaquetada y comprobar cancelación del remito/liberación de stock.
7. Probar recepción con daño/extravío/destrucción y verificar el resultado y la disponibilidad.
