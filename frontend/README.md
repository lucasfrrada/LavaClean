# LavaClean Frontend

Frontend web de LavaClean, orientado a clientes y administradores de una lavandería. La interfaz permite iniciar sesión, registrarse, agendar pedidos, revisar pedidos del cliente, editar datos personales y administrar entidades desde un panel privado.

---

## Estructura principal

```text
frontend/
└── src/
    ├── api/
    │   ├── apiClient.ts
    │   ├── authService.ts
    │   ├── pedidoService.ts
    │   ├── prendaService.ts
    │   ├── servicioService.ts
    │   └── usuarioService.ts
    │
    ├── components/
    │   └── NavbarMain.tsx
    │
    ├── context/
    │   └── AuthContext.tsx
    │
    ├── layouts/
    │   └── AdminLayout.tsx
    │
    ├── pages/
    │   ├── admin/
    │   │   ├── AdminDashboardPage.tsx
    │   │   ├── AdminOrdersPage.tsx
    │   │   ├── AdminPrendasPage.tsx
    │   │   ├── AdminServicesPage.tsx
    │   │   ├── AdminSettingsPage.tsx
    │   │   └── AdminUsersPage.tsx
    │   │
    │   ├── AgendarPage.tsx
    │   ├── LandingPage.tsx
    │   ├── LoginPage.tsx
    │   ├── PedidosPage.tsx
    │   ├── PerfilPage.tsx
    │   └── RegisterPage.tsx
    │
    ├── routes/
    │   ├── AdminRoute.tsx
    │   └── ProtectedRoute.tsx
    │
    ├── types/
    │   ├── auth.ts
    │   └── pedido.ts
    │
    ├── App.tsx
    └── main.tsx
```

---

## Funcionalidades principales

### Cliente

- Registro de usuario.
- Inicio de sesión.
- Cierre de sesión.
- Visualización de pedidos reales asociados al usuario.
- Agendamiento de nuevos pedidos.
- Visualización y edición de datos personales.

### Administrador

- Dashboard administrativo.
- Gestión de pedidos.
- Gestión de usuarios.
- Gestión de prendas.
- Gestión de servicios.
- Configuración general desde panel privado.

---

## Arquitectura del frontend

El frontend está organizado por responsabilidades:

| Carpeta | Descripción |
|---|---|
| `api/` | Servicios para consumir endpoints del backend. |
| `components/` | Componentes reutilizables. |
| `context/` | Contextos globales, como autenticación. |
| `layouts/` | Layouts reutilizables, por ejemplo el panel administrador. |
| `pages/` | Vistas principales de la aplicación. |
| `routes/` | Rutas protegidas y rutas exclusivas para administradores. |
| `types/` | Tipos TypeScript compartidos. |

---

## Autenticación

La autenticación se maneja mediante `AuthContext.tsx`, que mantiene el estado del usuario autenticado, el token y las operaciones de inicio/cierre de sesión.

El cliente HTTP centralizado en `apiClient.ts` agrega el encabezado de autorización cuando existe un token guardado:

```http
Authorization: Bearer <token>
```

Esto permite que las solicitudes protegidas al backend se realicen de forma centralizada y reutilizable.

---

## Servicios API

La carpeta `api/` contiene servicios separados por dominio:

| Archivo | Responsabilidad |
|---|---|
| `apiClient.ts` | Cliente base para llamadas HTTP. |
| `authService.ts` | Inicio de sesión, registro y autenticación. |
| `pedidoService.ts` | Operaciones relacionadas con pedidos. |
| `prendaService.ts` | Operaciones relacionadas con prendas. |
| `servicioService.ts` | Operaciones relacionadas con servicios. |
| `usuarioService.ts` | Operaciones relacionadas con usuarios/clientes. |

---

## Instalación

> Nota: al momento de la revisión, dentro de `frontend/` no se observan archivos como `package.json`, `vite.config.ts` o `index.html`. Si no están disponibles en tu copia local, debes restaurarlos o generarlos antes de ejecutar el proyecto.

Desde la raíz del repositorio:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

---

## Configuración sugerida si falta `package.json`

Si el frontend fue creado con React + Vite + TypeScript y falta el archivo `package.json`, puedes usar una base similar a esta y ajustarla según las dependencias reales del proyecto:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-router-dom": "latest"
  },
  "devDependencies": {}
}
```

Luego crea o verifica el archivo `index.html` en la raíz de `frontend/` y asegúrate de apuntar a `src/main.tsx`.

---

## Variables de entorno sugeridas

Para evitar URLs fijas en el código, se recomienda utilizar variables de entorno.

Archivo sugerido `.env.example`:

```env
VITE_API_AUTH_URL=http://localhost:8091
VITE_API_USUARIOS_URL=http://localhost:8090
VITE_API_PEDIDOS_URL=http://localhost:8082
VITE_API_INVENTARIO_URL=http://localhost:8083
VITE_API_PAGO_URL=http://localhost:8084
```

En código, las URLs pueden consumirse con:

```ts
import.meta.env.VITE_API_PEDIDOS_URL
```

---

## Rutas principales

La aplicación utiliza `react-router-dom` para definir rutas públicas, protegidas y administrativas.

Ejemplo de organización esperada:

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | Landing page | Público |
| `/login` | Login | Público |
| `/register` | Registro | Público |
| `/agendar` | Agendar pedido | Usuario autenticado |
| `/pedidos` | Mis pedidos | Usuario autenticado |
| `/perfil` | Perfil | Usuario autenticado |
| `/admin` | Dashboard admin | Administrador |
| `/admin/pedidos` | Gestión de pedidos | Administrador |
| `/admin/usuarios` | Gestión de usuarios | Administrador |
| `/admin/prendas` | Gestión de prendas | Administrador |
| `/admin/servicios` | Gestión de servicios | Administrador |

---

## Buenas prácticas recomendadas

- Crear archivo `.env.example` para documentar URLs de APIs.
- No guardar tokens sensibles fuera de mecanismos seguros.
- Manejar expiración de sesión.
- Centralizar mensajes de error.
- Separar tipos por dominio.
- Agregar validaciones visuales en formularios.
- Incorporar pruebas para componentes críticos.
- Agregar manejo de loading y estados vacíos.

---

## Build para producción

```bash
npm run build
```

El resultado quedará normalmente en la carpeta:

```text
dist/
```

Para previsualizar el build:

```bash
npm run preview
```
