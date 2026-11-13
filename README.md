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
- Backend de la API corriendo en `http://127.0.0.1:8000`

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. El backend permite los orígenes locales
`localhost` y `127.0.0.1` por CORS.

### Variables de entorno

| Variable       | Descripción                | Valor por defecto       |
| -------------- | -------------------------- | ----------------------- |
| `VITE_API_URL` | URL base de la API backend | `http://127.0.0.1:8000` |

## Scripts

| Comando                | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR           |
| `npm run build`        | Chequeo de tipos + build de producción   |
| `npm run preview`      | Previsualizar el build                   |
| `npm run lint`         | Lint con Oxlint                          |
| `npm run format`       | Formatear con Prettier                   |
| `npm run format:check` | Verificar formato sin modificar archivos |

## Acceso local

La API actual no implementa autenticación; la interfaz consume sus endpoints directamente para la
demostración local. El backend y PostgreSQL del `docker-compose.yml` se publican en `127.0.0.1`.
No expongas esta configuración en una red pública. Un despliegue público requiere autenticación y
controles de acceso antes de habilitar operaciones.

## Estructura

```text
src/
  api/          Cliente Axios y llamadas a la API
  components/   Layout, guards y componentes de UI reutilizables
  features/     Lógica por dominio (auth)
  lib/          Utilidades (storage, errores)
  pages/        Vistas de la aplicación
  types/        Tipos compartidos de la API
```

## Alcance actual

- **M0**: base del proyecto, Tailwind, alias `@`, lint/format.
- **M1**: autenticación, sesión persistente, guards por rol, layout con sidebar/topbar y rutas
  protegidas. Las secciones funcionales quedan como placeholders hasta los próximos hitos.
