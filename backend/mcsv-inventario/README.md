# mcsv-inventario

Microservicio de inventario de **LavaClean**, desarrollado con **Spring Boot** y **PostgreSQL**. Su responsabilidad es administrar los productos, proveedores, compras y movimientos de inventario utilizados por la lavandería.

## Resumen

`mcsv-inventario` permite controlar el stock de productos e insumos. Desde el panel administrador del frontend se pueden consultar y gestionar productos, proveedores y movimientos de inventario para mantener trazabilidad de entradas y salidas.

## Funcionalidades principales

- Gestión de productos de inventario.
- Gestión de proveedores.
- Registro de movimientos de inventario.
- Registro de compras de inventario.
- Control de entradas y salidas de stock.
- Consulta de movimientos por tipo.
- Persistencia en PostgreSQL.

## Tecnologías utilizadas

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL
- Hibernate
- Maven
- Lombok

## Puerto por defecto

```txt
8083
```

## Estructura general

```txt
mcsv-inventario/
├── src/main/java/com/lavaclean/mcsv_inventario/
│   ├── api/              # Controladores REST
│   ├── application/      # Casos de uso y lógica de negocio
│   ├── domain/model/     # Entidades del dominio
│   ├── infraestructure/  # Persistencia y configuración
│   └── McsvInventarioApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```

## Variables recomendadas para entorno local

```env
DB_URL=jdbc:postgresql://localhost:5432/lavaclean_inventario
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## Configuración base esperada

```properties
spring.application.name=mcsv-inventario
server.port=8083
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Ejecución local

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

## Endpoints principales

```txt
GET    /productos
POST   /productos
PUT    /productos/{id}
DELETE /productos/{id}

GET    /proveedores
POST   /proveedores
PUT    /proveedores/{id}
DELETE /proveedores/{id}

GET    /movimientos-inventario
POST   /movimientos-inventario
GET    /movimientos-inventario/tipo/{tipo}

GET    /compras-inventario
POST   /compras-inventario
```

## Relación con otros servicios

- **frontend**: consume este servicio desde el panel administrador para la gestión de inventario.
- **mcsv-pedidos**: puede integrarse con inventario para descontar o registrar consumos asociados al procesamiento de pedidos.

## Notas de seguridad

No subir credenciales reales de base de datos al repositorio. Utilizar variables de entorno en local, staging y producción.
