# LavaClean Frontend

Frontend web de **LavaClean**, desarrollado con **React**, **TypeScript**, **Vite** y **Tailwind CSS**. Esta aplicación permite a clientes y administradores interactuar con los microservicios de LavaClean mediante una interfaz moderna, protegida por autenticación JWT.

## Resumen

El frontend funciona como una SPA para la plataforma LavaClean. Incluye páginas públicas para landing, login y registro; vistas de cliente para agendar pedidos, revisar pedidos y administrar perfil; y un panel administrativo para gestionar pedidos, usuarios, servicios, prendas e inventario.

## Funcionalidades principales

- Landing page pública.
- Inicio de sesión y registro de usuarios.
- Protección de rutas mediante autenticación.
- Rutas separadas para cliente y administrador.
- Agendamiento de pedidos por parte del cliente.
- Visualización de pedidos del cliente.
- Edición de perfil del usuario.
- Panel administrador con dashboard.
- Gestión administrativa de pedidos.
- Gestión de clientes/usuarios.
- Gestión de servicios.
- Gestión de prendas.
- Gestión de inventario.
- Consumo de APIs mediante variables de entorno.
- Manejo de token JWT en las peticiones al backend.
- Pruebas frontend con Vitest y Testing Library.

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Motion
- Lucide React
- JWT Decode
- Vitest
- Testing Library

## Estructura general

```txt
frontend/
├── public/
├── src/
│   ├── api/              # Servicios para consumir APIs backend
│   ├── assets/           # Recursos estáticos
│   ├── components/       # Componentes reutilizables
│   ├── context/          # Contextos globales
│   ├── layouts/          # Layouts principales
│   ├── pages/            # Páginas públicas, cliente y admin
│   ├── routes/           # Protección y configuración de rutas
│   ├── test/             # Configuración de pruebas
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Utilidades generales
├── package.json
├── vite.config.ts
└── README.md
```

## Variables de entorno

Crear un archivo `.env.local` en la raíz del frontend:

```env
VITE_AUTH_API_URL=http://localhost:8091
VITE_USUARIO_API_URL=http://localhost:8090
VITE_PEDIDO_API_URL=http://localhost:8082
VITE_INVENTARIO_API_URL=http://localhost:8083
```

Para producción, reemplazar cada URL por la URL pública correspondiente de cada microservicio desplegado.

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Por defecto, Vite levanta el proyecto en:

```txt
http://localhost:5173
```

## Compilar para producción

```bash
npm run build
```

## Previsualizar build

```bash
npm run preview
```

## Ejecutar pruebas

```bash
npm run test
```

## Ejecutar pruebas con coverage

```bash
npm run coverage
```

## Integración con backend

El frontend consume los siguientes microservicios:

- **mcsv-auth**: autenticación y generación de token JWT.
- **mcsv-usuario**: gestión de usuarios/clientes.
- **mcsv-pedidos**: gestión de pedidos, prendas y servicios.
- **mcsv-inventario**: gestión de productos, proveedores y movimientos de inventario.

Las peticiones se realizan desde la carpeta `src/api`, donde cada archivo representa un servicio de comunicación con una API específica.

## Notas de seguridad

No subir archivos `.env.local` ni credenciales reales al repositorio. Las URLs, tokens o claves sensibles deben manejarse mediante variables de entorno.
