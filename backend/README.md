# LavaClean Backend

Backend de LavaClean construido con Java 21, Spring Boot y Maven. El backend está organizado bajo una arquitectura de microservicios, donde cada módulo se encarga de un dominio específico del sistema de lavandería.

---

## Estructura general

```text
backend/
├── mcsv-auth/
├── mcsv-inventario/
├── mcsv-notificacion/
├── mcsv-pago/
├── mcsv-pedidos/
├── mcsv-usuario/
└── pom.xml
```

El archivo `pom.xml` ubicado en `backend/` funciona como proyecto padre Maven y agrupa los microservicios como módulos.

---

## Microservicios

| Módulo | Descripción | Puerto identificado | Base de datos identificada |
|---|---|---:|---|
| `mcsv-auth` | Autenticación, seguridad y JWT. | `8091` | No aplica directamente / depende de usuarios |
| `mcsv-usuario` | Gestión de usuarios y clientes. | `8090` | `usuarios_db` |
| `mcsv-pedidos` | Gestión de pedidos, prendas y servicios. | `8082` | `pedidos_db` |
| `mcsv-inventario` | Gestión de productos, proveedores, compras y movimientos de inventario. | `8083` | `inventario_db` |
| `mcsv-pago` | Gestión de pagos e integración con MercadoPago. | `8084` | `pago_db` |
| `mcsv-notificacion` | Gestión de notificaciones/correos. | Revisar `application.properties` | H2 según dependencias del módulo |

---

## Tecnologías principales

- Java 21.
- Spring Boot.
- Spring Web / WebMVC.
- Spring Data JPA.
- Spring Security.
- Spring Validation.
- Spring Cloud OpenFeign.
- PostgreSQL.
- H2.
- Lombok.
- Maven.
- JWT.
- MercadoPago SDK.
- Spring Mail.
- Springdoc OpenAPI en el microservicio de pedidos.

---

## Requisitos previos

Antes de ejecutar el backend, asegúrate de tener instalado:

- Java 21.
- Maven 3.9+ o usar los Maven Wrapper de cada microservicio.
- PostgreSQL.
- Un cliente de base de datos como pgAdmin o DBeaver.
- Postman, Insomnia o similar para pruebas de API.

Verifica Java y Maven:

```bash
java -version
mvn -version
```

---

## Bases de datos requeridas

Crea las bases de datos principales en PostgreSQL:

```sql
CREATE DATABASE usuarios_db;
CREATE DATABASE pedidos_db;
CREATE DATABASE inventario_db;
CREATE DATABASE pago_db;
```

> Importante: los nombres pueden ajustarse según tu entorno, pero deben coincidir con las URLs configuradas en cada `application.properties` o con tus variables de entorno.

---

## Configuración segura recomendada

Evita dejar usuarios, contraseñas o tokens directamente en `application.properties`. Se recomienda usar variables de entorno.

Ejemplo:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Para MercadoPago:

```properties
mercadopago.access.token=${MERCADOPAGO_ACCESS_TOKEN}
```

Ejemplo de variables de entorno en Linux/macOS:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/pedidos_db
export DB_USERNAME=postgres
export DB_PASSWORD=tu_password
export MERCADOPAGO_ACCESS_TOKEN=tu_token
```

En Windows PowerShell:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/pedidos_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="tu_password"
$env:MERCADOPAGO_ACCESS_TOKEN="tu_token"
```

---

## Compilar backend completo

Desde la carpeta `backend`:

```bash
cd backend
mvn clean install
```

Esto compilará el proyecto padre y sus módulos.

---

## Ejecutar microservicios

Puedes ejecutar cada microservicio de forma individual.

### Auth

```bash
cd backend/mcsv-auth
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

Servicio esperado en:

```text
http://localhost:8091
```

---

### Usuarios

```bash
cd backend/mcsv-usuario
./mvnw spring-boot:run
```

Servicio esperado en:

```text
http://localhost:8090
```

---

### Pedidos

```bash
cd backend/mcsv-pedidos
./mvnw spring-boot:run
```

Servicio esperado en:

```text
http://localhost:8082
```

---

### Inventario

```bash
cd backend/mcsv-inventario
./mvnw spring-boot:run
```

Servicio esperado en:

```text
http://localhost:8083
```

---

### Pagos

```bash
cd backend/mcsv-pago
./mvnw spring-boot:run
```

Servicio esperado en:

```text
http://localhost:8084
```

---

### Notificaciones

```bash
cd backend/mcsv-notificacion
./mvnw spring-boot:run
```

El puerto debe revisarse en el archivo de configuración del módulo.

---

## Ejecución desde el proyecto padre

Si tienes Maven instalado globalmente, también puedes ejecutar un módulo desde `backend/` usando `-pl`.

Ejemplo:

```bash
cd backend
mvn -pl mcsv-pedidos spring-boot:run
```

---

## Endpoints identificados

### Microservicio de pedidos

Base URL:

```text
http://localhost:8082
```

#### Pedidos

```http
POST   /api/pedidos
GET    /api/pedidos
GET    /api/pedidos/{id}
PUT    /api/pedidos/{id}
PATCH  /api/pedidos/{id}/estado
DELETE /api/pedidos/{id}
```

#### Prendas

```http
POST   /api/prendas
GET    /api/prendas
GET    /api/prendas/{id}
PUT    /api/prendas/{id}
DELETE /api/prendas/{id}
```

#### Servicios

```http
POST   /api/servicios
GET    /api/servicios
GET    /api/servicios/{id}
PUT    /api/servicios/{id}
DELETE /api/servicios/{id}
```

---

## Organización interna del microservicio de pedidos

El microservicio `mcsv-pedidos` utiliza una separación por capas:

```text
mcsv-pedidos/
└── src/main/java/mcsv/pedidos/
    ├── api/
    │   ├── controller/
    │   └── dto/
    ├── application/
    │   ├── mapper/
    │   └── service/
    ├── domain/
    │   └── model/
    ├── infraestructure/
    │   ├── client/
    │   ├── config/
    │   └── persistence/
    └── PedidosApplication.java
```

Esta estructura permite separar:

- Controladores REST.
- DTOs de entrada/salida.
- Servicios de aplicación.
- Modelos de dominio.
- Persistencia e integración con otros servicios.

---

## Comunicación entre microservicios

El backend utiliza OpenFeign en varios módulos. Esto permite que un microservicio consulte información de otro sin acoplar directamente sus bases de datos.

Ejemplo de uso esperado:

- `mcsv-pedidos` puede consultar datos del usuario en `mcsv-usuario`.
- `mcsv-auth` puede apoyarse en la información de usuarios para validar credenciales.
- `mcsv-pago` puede relacionar pagos con pedidos.
- `mcsv-notificacion` puede enviar correos o avisos asociados a eventos del sistema.

---

## Orden sugerido para levantar servicios localmente

1. PostgreSQL.
2. `mcsv-usuario`.
3. `mcsv-auth`.
4. `mcsv-pedidos`.
5. `mcsv-inventario`.
6. `mcsv-pago`.
7. `mcsv-notificacion`.
8. Frontend.

---

## Pruebas manuales con Postman

Se recomienda crear una colección con carpetas separadas:

```text
LavaClean API/
├── Auth
├── Usuarios
├── Pedidos
├── Prendas
├── Servicios
├── Inventario
├── Pagos
└── Notificaciones
```

Variables sugeridas de entorno en Postman:

```text
AUTH_URL=http://localhost:8091
USUARIOS_URL=http://localhost:8090
PEDIDOS_URL=http://localhost:8082
INVENTARIO_URL=http://localhost:8083
PAGO_URL=http://localhost:8084
TOKEN=<jwt>
```

---

## Swagger / OpenAPI

El microservicio `mcsv-pedidos` incluye dependencia de Springdoc OpenAPI. Si está correctamente configurado, la documentación puede estar disponible en:

```text
http://localhost:8082/swagger-ui/index.html
```

O en:

```text
http://localhost:8082/v3/api-docs
```

---

## Recomendaciones para producción

Antes de desplegar, se recomienda:

- Crear perfiles `dev`, `test` y `prod`.
- Reemplazar credenciales hardcodeadas por variables de entorno.
- Agregar Dockerfile por microservicio.
- Agregar `docker-compose.yml` para levantar servicios y bases de datos.
- Configurar logs estructurados.
- Agregar trazabilidad distribuida.
- Agregar manejo centralizado de errores.
- Configurar gateway/API Gateway si el número de microservicios aumenta.
- Agregar pruebas unitarias y de integración.
- Configurar CI/CD con GitHub Actions.
- Revisar CORS y seguridad JWT.

---

## Comandos útiles

Compilar sin ejecutar tests:

```bash
mvn clean install -DskipTests
```

Ejecutar un módulo específico desde `backend`:

```bash
mvn -pl mcsv-pedidos spring-boot:run
```

Limpiar compilación:

```bash
mvn clean
```

Ejecutar tests:

```bash
mvn test
```
