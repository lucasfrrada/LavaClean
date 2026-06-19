# LavaClean

LavaClean es una aplicación fullstack orientada a la gestión de una lavandería. El proyecto está dividido en una parte **frontend** construida con React/TypeScript y una parte **backend** basada en microservicios Java con Spring Boot.

El sistema contempla funcionalidades para clientes y administradores, incluyendo autenticación, gestión de usuarios, registro de pedidos, administración de prendas y servicios, inventario, pagos y notificaciones.

---

## Estructura del repositorio

```text
LavaClean/
├── backend/
│   ├── mcsv-auth/
│   ├── mcsv-inventario/
│   ├── mcsv-notificacion/
│   ├── mcsv-pago/
│   ├── mcsv-pedidos/
│   ├── mcsv-usuario/
│   └── pom.xml
│
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── layouts/
        ├── pages/
        ├── routes/
        ├── types/
        ├── App.tsx
        └── main.tsx
```

---

## Módulos principales

### Frontend

Interfaz web para clientes y administradores. Incluye páginas de inicio, login, registro, agendamiento de pedidos, perfil de usuario, pedidos del cliente y panel administrativo.

Principales secciones:

- Landing page.
- Login y registro.
- Agendamiento de pedidos.
- Perfil del cliente.
- Pedidos del cliente.
- Panel de administración.
- Gestión de usuarios, pedidos, prendas y servicios.

Ver más detalles en [`frontend/README.md`](frontend/README.md).

---

### Backend

Backend dividido en microservicios Spring Boot. Cada microservicio tiene su propio módulo Maven y responsabilidades separadas.

| Microservicio | Responsabilidad principal | Puerto identificado |
|---|---:|---:|
| `mcsv-auth` | Autenticación y seguridad | `8091` |
| `mcsv-usuario` | Gestión de usuarios/clientes | `8090` |
| `mcsv-pedidos` | Gestión de pedidos, prendas y servicios | `8082` |
| `mcsv-inventario` | Gestión de inventario | `8083` |
| `mcsv-pago` | Gestión de pagos e integración de pagos | `8084` |
| `mcsv-notificacion` | Notificaciones/correos | Revisar configuración del módulo |

Ver más detalles en [`backend/README.md`](backend/README.md).

---

## Tecnologías utilizadas

### Frontend

- React.
- TypeScript.
- React Router DOM.
- Context API para manejo de sesión/autenticación.
- Consumo de APIs mediante servicios en `src/api`.

### Backend

- Java 21.
- Spring Boot.
- Spring Web / WebMVC.
- Spring Data JPA.
- Spring Security.
- Spring Cloud OpenFeign.
- PostgreSQL.
- H2 en módulos auxiliares.
- Lombok.
- Maven.
- JWT para autenticación.
- MercadoPago SDK en el microservicio de pagos.

---

## Flujo general de la aplicación

1. El usuario se registra o inicia sesión desde el frontend.
2. El frontend guarda la sesión del usuario y el token de autenticación.
3. El cliente puede agendar pedidos y revisar su información.
4. El administrador puede acceder al panel administrativo.
5. Desde el panel se gestionan pedidos, usuarios, prendas y servicios.
6. El backend procesa la lógica de negocio mediante microservicios independientes.
7. Los microservicios se comunican entre sí cuando necesitan consultar información de otros dominios.

---

## Instalación general

Clona el repositorio:

```bash
git clone https://github.com/lucasfrrada/LavaClean.git
cd LavaClean
```

Luego revisa las instrucciones específicas:

```bash
# Frontend
cd frontend

# Backend
cd backend
```

---

## Ejecución local recomendada

### 1. Preparar bases de datos

Crea las bases de datos necesarias en PostgreSQL:

```sql
CREATE DATABASE usuarios_db;
CREATE DATABASE pedidos_db;
CREATE DATABASE inventario_db;
CREATE DATABASE pago_db;
```

Ajusta los usuarios, contraseñas y URLs de conexión según tu entorno local.

---

### 2. Levantar microservicios backend

Desde la carpeta `backend`, puedes compilar el proyecto padre con Maven:

```bash
mvn clean install
```

Luego ejecuta cada microservicio desde su carpeta correspondiente o mediante Maven usando el módulo específico.

Ejemplo:

```bash
cd backend/mcsv-pedidos
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

---

### 3. Levantar frontend

El frontend debe ejecutarse desde la carpeta `frontend`. Si el proyecto no incluye todavía los archivos de configuración como `package.json`, `vite.config.ts` o `index.html`, se deben restaurar o generar antes de iniciar la aplicación.

Comando típico para un proyecto React con Vite:

```bash
npm install
npm run dev
```

---

## Variables de entorno recomendadas

Actualmente la configuración del backend se encuentra en archivos `application.properties`. Para un entorno real, se recomienda no dejar credenciales ni tokens directamente en el repositorio.

Ejemplo recomendado:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
mercadopago.access.token=${MERCADOPAGO_ACCESS_TOKEN}
```

---

## Seguridad

Antes de desplegar el proyecto en producción, se recomienda:

- Mover credenciales de base de datos a variables de entorno.
- No versionar tokens, claves privadas ni contraseñas.
- Rotar cualquier credencial que haya sido subida al repositorio.
- Configurar CORS de forma controlada.
- Validar correctamente los permisos por rol.
- Revisar la configuración JWT.
- Agregar perfiles separados para `dev`, `test` y `prod`.

---

## Estado del proyecto

El repositorio presenta una base funcional de aplicación fullstack con separación entre frontend y backend, y un backend organizado en microservicios. Como mejoras futuras se recomienda:

- Agregar documentación de endpoints por microservicio.
- Incorporar Docker Compose para levantar frontend, backend y bases de datos.
- Agregar archivos `.env.example`.
- Crear pruebas unitarias e integración.
- Agregar documentación Swagger/OpenAPI consolidada.
- Mejorar manejo de errores y trazabilidad.
- Agregar CI/CD con GitHub Actions.

---

## Guía: Creación de Nuevos Microservicios

Todo nuevo microservicio debe generarse siguiendo un estándar estricto utilizando [Spring Initializr](https://start.spring.io/). Esto asegura la compatibilidad con nuestra versión de Java.

### Paso 1: Configuración Base en Spring Initializr
Al crear un nuevo servicio (ej. `mcsv-pago`), configura los siguientes parámetros iniciales:
* **Project:** Maven
* **Language:** Java
* **Spring Boot:** 3.x.x (La versión estable más reciente compatible con Spring Cloud 2025.1.1)
* **Project Metadata:**
  * **Group:** `com.lavaclean`
  * **Artifact:** `mcsv-[nombre-del-servicio]` (ej. `mcsv-pago`)
  * **Packaging:** Jar
  * **Java:** 21

### Paso 2: Selección de Dependencias Estándar

**Dependencias Transversales (Obligatorias en todos los servicios):**
* `Lombok`: Para reducir el código boilerplate.
* `Spring Web`: Para exponer la API REST.
* `OpenFeign`: Para la comunicación síncrona entre microservicios.

**Dependencias de Persistencia:**
* `Spring Data JPA` + `PostgreSQL Driver`: Para servicios transaccionales core.
* `Spring Data JPA` + `H2 Database`: Solo para servicios ligeros o en memoria (ej. notificaciones).

### Paso 3: Estructuración Hexagonal del Proyecto
Una vez descargado y extraído el `.zip` de Spring Initializr, no programes directamente en la carpeta raíz. Debes reestructurar los paquetes para cumplir con el patrón de **Puertos y Adaptadores**:

```text
src/main/java/com/lavaclean/usuario
├── api/
│   ├── controller/        # Endpoints REST (Adaptadores de entrada)
│   └── dto/               
│       ├── request/       # Objetos de entrada de datos
│       └── response/      # Objetos de salida de datos
├── application/
│   ├── mapper/            # Transformadores entre Entity y DTO
│   └── service/           # Lógica de orquestación y casos de uso
├── domain/
│   ├── exception/         # Excepciones personalizadas del negocio
│   └── model/             # Entidades core del negocio (Interfaces/Enums)
├── infrastructure/
│   ├── config/            # Configuraciones globales (Beans, Seguridad, etc.)
│   └── persistence/
│       ├── entity/        # Entidades JPA (Mapeo a base de datos)
│       └── repository/    # Interfaces de Spring Data JPA
└── McsvUsuarioApplication.java # Clase principal de arranque de Spring Boot

## Licencia

No se encontró un archivo `LICENSE` en la raíz del repositorio al momento de esta revisión. Si el proyecto será distribuido o publicado formalmente, se recomienda agregar una licencia.
