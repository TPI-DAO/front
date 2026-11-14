# Biblioteca — Frontend

## 1. Cómo levantar el proyecto

### Requisitos

- Node.js **22.12 o superior en la rama 22** (también compatible con Node 20.19+)
  y npm.
- El backend en ejecución en `http://127.0.0.1:8000`. Seguí primero el
  [README del backend](https://github.com/TPI-DAO/back#readme) para levantar
  la API y PostgreSQL.

### Puesta en marcha

Ejecutá los comandos desde la raíz de este repositorio (`front/`).

1. Creá `.env` a partir del ejemplo, si todavía no lo tenés.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Linux / macOS:

   ```bash
   cp .env.example .env
   ```

2. Verificá la dirección de la API en `.env`:

   ```dotenv
   VITE_API_URL=http://127.0.0.1:8000
   ```

3. Instalá las dependencias e iniciá el servidor:

   ```bash
   npm ci
   npm run dev
   ```

4. Abrí **http://localhost:5173** e ingresá con el administrador inicial del
   backend: **`admin` / `admin1234`**, salvo que hayas cambiado sus credenciales.
   Las cuentas de socios se crean desde la gestión de usuarios del administrador.

Vite muestra la dirección efectiva en la terminal. El backend permite por defecto
los orígenes `localhost` y `127.0.0.1` en los puertos 5173 y 3000. Si usás otro
puerto u origen, agregalo a `CORS_ORIGINS` en el backend. Si cambiás `.env`,
reiniciá el servidor de desarrollo. Para detenerlo, presioná `Ctrl+C`.

### Compilar y previsualizar

```bash
npm run build
npm run preview
```

El build verifica los tipos y genera los archivos estáticos en `dist/`.
La previsualización local queda normalmente en http://localhost:4173; para
consultar la API desde ese origen, agregalo a `CORS_ORIGINS` en el backend.

## 2. De qué trata el proyecto

Interfaz web del Trabajo Práctico Integrador de **Diseño de Aplicaciones
(DAO 2026), Grupo 5**: un sistema de préstamos interbibliotecarios entre
múltiples sedes.

Permite consultar libros y su disponibilidad, gestionar reservas y préstamos,
seguir envíos de ejemplares mediante remitos y registrar devoluciones con multas
cuando corresponde. La experiencia y las pantallas disponibles dependen del rol.

### Funcionalidades por rol

| Rol       | Funcionalidades                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SOCIO** | Catálogo con filtros, detalle del libro, disponibilidad por sede, solicitudes y cancelaciones propias de préstamos/reservas, consulta de sus movimientos y perfil con cambio de contraseña. |
| **ADMIN** | Gestión de sedes, socios, libros, ejemplares y usuarios; administración de préstamos, reservas, remitos y devoluciones; control de vencimientos, trazabilidad y reportes.                   |

Los reportes de la interfaz muestran préstamos activos y en tránsito, vencidos y
multas, libros más solicitados y disponibilidad por sede, mediante tablas y
gráficos de barras.

## 3. Tecnologías utilizadas

| Tecnología                    | Uso en el proyecto                                                              |
| ----------------------------- | ------------------------------------------------------------------------------- |
| React 19                      | Componentes y renderizado de la interfaz como aplicación de página única (SPA). |
| TypeScript                    | Tipado de componentes, formularios y contratos de la API.                       |
| Vite 8                        | Servidor de desarrollo y build de producción.                                   |
| Tailwind CSS 4                | Estilos mediante clases utilitarias.                                            |
| React Router 7                | Navegación, rutas anidadas y composición de rutas protegidas.                   |
| TanStack Query 5              | Consultas al servidor, caché, mutaciones e invalidación de datos.               |
| Axios                         | Cliente HTTP, envío del token y tratamiento común de respuestas.                |
| React Hook Form               | Gestión del estado y envío de formularios.                                      |
| Zod / resolvers               | Validación de formularios e integración con React Hook Form.                    |
| Lucide React                  | Iconografía.                                                                    |
| Vitest                        | Pruebas automatizadas de operaciones con un adaptador HTTP en memoria.          |
| Oxlint                        | Análisis estático del código.                                                   |
| Prettier y plugin de Tailwind | Formato del código y orden de clases.                                           |
| Node.js / npm                 | Ejecución de herramientas y gestión de dependencias con `package-lock.json`.    |

## 4. Arquitectura y organización

```text
src/
  App.tsx       Definición de rutas y permisos de navegación
  main.tsx      Inicio y proveedores globales
  api/          Cliente Axios y llamadas HTTP por dominio
  components/   Layout, controles de acceso y componentes de UI
  features/     Lógica por dominio: auth, catálogo, administración y operaciones
  lib/          Storage, errores, formatos, query keys y feedback
  pages/        Pantallas del socio y páginas de administración
  types/        Tipos compartidos de la API
```

Las páginas componen componentes reutilizables y delegan las llamadas HTTP en
`api/`. Los módulos de `features/` reúnen lógica y hooks de cada dominio.
`pages/OperationsPage.tsx` contiene la vista de reportes utilizada por la ruta
`/admin/reportes`, incluidos sus gráficos.

## 5. Patrones y decisiones de diseño

- **Composición de componentes:** layout, formularios, tablas, modales y estados
  de carga/error se reutilizan para construir las pantallas.
- **Context + Provider:** `AuthProvider` mantiene la sesión y expone el usuario,
  el inicio y el cierre de sesión mediante `AuthContext`.
- **Hooks personalizados:** encapsulan consultas, mutaciones, validaciones y
  feedback; por ejemplo, `useOperacionMutation` coordina una operación con la
  actualización de los datos relacionados.
- **Rutas protegidas:** `ProtectedRoute` exige autenticación y `RequireRole`
  restringe el acceso según el rol.
- **Cliente HTTP centralizado:** `api/client.ts` configura la URL base y los
  interceptores para autenticación y errores de sesión.
- **Caché de estado del servidor:** TanStack Query identifica las consultas por
  claves e invalida las afectadas después de las mutaciones.
- **Carga diferida:** las páginas declaradas con `lazy` se cargan bajo demanda,
  con `Suspense` para presentar el estado de espera.

Los patrones de negocio **State** (remitos) y **Strategy** (multas) están
implementados en el backend. La interfaz presenta las acciones y resultados de
esas reglas; el servidor valida las transiciones y calcula los importes.

## 6. Operaciones y transacciones

El frontend envía peticiones HTTP; las transacciones de base de datos se resuelven
en el backend. Cada acción del circuito tiene su propia confirmación:

| Acción en la interfaz           | Resultado esperado del backend                                                  |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Solicitar préstamo local        | Activa el préstamo y registra su vencimiento.                                   |
| Solicitar préstamo entre sedes  | Deja la solicitud pendiente y reserva el ejemplar.                              |
| Empaquetar, despachar y recibir | Crea y actualiza el remito, su historial y los estados del préstamo y ejemplar. |
| Cancelar una solicitud          | Cancela el préstamo, el remito empaquetado si existe y libera el ejemplar.      |
| Registrar una devolución        | Calcula atraso/multa y genera el retorno cuando corresponde.                    |

En las pantallas de operaciones, `useOperacionMutation` espera la respuesta
correcta y luego invalida las consultas de préstamos, reservas, remitos,
devoluciones, ejemplares, disponibilidad y reportes antes de completar el flujo
de éxito. Esto permite volver a consultar los datos afectados por una misma
operación. Los errores de negocio se muestran como feedback al usuario.

Reglas relevantes para el uso:

- El socio de las solicitudes propias se obtiene de la sesión.
- Solo pueden cancelarse préstamos `SOLICITADO` y reservas `ACTIVA`.
- Un remito `EMPAQUETADO` puede despacharse y uno `DESPACHADO` puede recibirse.
- La recepción admite `BUENO`, `DANADO`, `EXTRAVIADO` y `DESTRUIDO`;
  el backend determina los estados resultantes.
- Se registran devoluciones de préstamos `ACTIVO` o `VENCIDO`.
- Los remitos de retorno se generan automáticamente al devolver, cuando
  corresponde; luego se despachan y reciben desde su gestión.

## 7. Autenticación e integración con la API

1. El login envía las credenciales a `POST /auth/token` como formulario.
2. El token JWT se guarda en `localStorage` y se adjunta como
   `Authorization: Bearer <token>` en las peticiones.
3. `GET /auth/me` permite recuperar el usuario y su rol al cargar la aplicación.
4. Ante una respuesta `401`, se limpia la sesión y la caché, y las rutas
   protegidas llevan al login.

Los permisos de navegación se complementan con la autorización del backend,
que controla el acceso a los endpoints y las operaciones propias de cada socio.

## 8. Comandos y pruebas

| Comando                | Descripción                                                |
| ---------------------- | ---------------------------------------------------------- |
| `npm ci`               | Instalar las dependencias fijadas en el lockfile.          |
| `npm run dev`          | Iniciar el servidor de desarrollo con recarga en caliente. |
| `npm run build`        | Verificar tipos y generar el build de producción.          |
| `npm run typecheck`    | Ejecutar la comprobación de TypeScript.                    |
| `npm run preview`      | Previsualizar el build localmente.                         |
| `npm run lint`         | Analizar el código con Oxlint.                             |
| `npm run format`       | Formatear con Prettier.                                    |
| `npm run format:check` | Verificar formato sin modificar archivos.                  |
| `npm test`             | Ejecutar las pruebas con Vitest.                           |

Las pruebas de `src/features/operaciones/operaciones.test.ts` cubren identidad
del socio, validaciones previas al envío, payloads HTTP, errores de negocio,
prevención de remitos duplicados e invalidación de consultas. Utilizan un
adaptador HTTP en memoria y no necesitan la API ni la base de datos.

### Recorrido de verificación manual

Con back y front en ejecución:

1. Solicitar un préstamo local y devolverlo; comprobar estado físico, atraso y multa.
2. Solicitar uno interbibliotecario, empaquetarlo, despacharlo y recibirlo en buen estado.
3. Registrar su devolución y despachar/recibir el retorno generado automáticamente.
4. Consultar la trazabilidad por número y verificar el historial de ambas direcciones.
5. Reservar un libro, solicitarlo desde la misma sede y comprobar que la reserva se cumple.
6. Cancelar una solicitud empaquetada y comprobar la cancelación del remito y la liberación del ejemplar.
7. Probar recepciones con daño, extravío o destrucción y verificar el resultado y la disponibilidad.
8. Consultar los cuatro reportes. Para agregar actividad de demostración a una base
   existente, ejecutar desde `back/` el comando de carga explicado en su README.
