# mcsv-pedidos

Microservicio de pedidos de **LavaClean**, desarrollado con **Spring Boot**, **PostgreSQL**, **Flyway** y **Kafka**. Su responsabilidad es administrar los pedidos de lavandería, sus servicios, prendas, estados y eventos asociados.

## Resumen

`mcsv-pedidos` es el núcleo operativo de LavaClean. Permite crear pedidos, asociar prendas y servicios, actualizar estados, confirmar pesaje, agregar servicios extra y publicar eventos cuando cambia el estado de un pedido. Estos eventos son utilizados por el microservicio de notificaciones.

## Funcionalidades principales

- Creación de pedidos.
- Consulta de pedidos.
- Actualización de estado de pedidos.
- Confirmación de peso del pedido.
- Agregado de servicios extra.
- Eliminación de pedidos.
- Gestión de prendas.
- Gestión de servicios base y extra.
- Activación/desactivación de servicios.
- Persistencia en PostgreSQL.
- Migraciones de base de datos con Flyway.
- Publicación de eventos Kafka ante cambios de estado.

## Estados de pedido manejados

El frontend contempla estados como:

```txt
PENDIENTE_CONFIRMACION
PENDIENTE_PESAJE
LISTO_PARA_RETIRO
REVISION
CONFIRMADO
EN_PROCESO
COMPLETADO
ENTREGADO
PAGADO
CANCELADO
```

## Tecnologías utilizadas

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL
- Hibernate
- Flyway
- Spring Kafka
- Maven
- Lombok

## Puerto por defecto

```txt
8082
```

## Estructura general

```txt
mcsv-pedidos/
├── src/main/java/com/lavaclean/pedidos/
│   ├── api/              # Controladores REST
│   ├── application/      # Casos de uso y lógica de negocio
│   ├── domain/model/     # Entidades del dominio
│   ├── infraestructure/  # Persistencia, Kafka y configuración
│   └── PedidosApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/     # Migraciones Flyway
├── pom.xml
└── README.md
```

## Variables recomendadas para entorno local

```env
DB_URL=jdbc:postgresql://localhost:5432/lavaclean_pedidos
DB_USERNAME=postgres
DB_PASSWORD=postgres
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## Configuración base esperada

```properties
spring.application.name=pedidos
server.port=8082
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.kafka.bootstrap-servers=${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
app.kafka.topic.pedido-estado-cambiado=pedido-estado-cambiado
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

### Pedidos

```txt
GET    /pedidos
POST   /pedidos
PATCH  /pedidos/{id}/estado
PATCH  /pedidos/{id}/confirmar-peso
POST   /pedidos/{id}/servicios-extras
DELETE /pedidos/{id}
```

### Prendas

```txt
GET    /prendas
POST   /prendas
PUT    /prendas/{id}
DELETE /prendas/{id}
```

### Servicios

```txt
GET    /servicios
GET    /servicios/base
GET    /servicios/extras
POST   /servicios
PUT    /servicios/{id}
PATCH  /servicios/{id}/activo?activo=true
DELETE /servicios/{id}
```

## Kafka

El servicio publica eventos en el tópico:

```txt
pedido-estado-cambiado
```

Este evento permite que `mcsv-notificacion` envíe correos o avisos al cliente cuando cambia el estado del pedido.

## Relación con otros servicios

- **frontend**: consume este servicio para agendar pedidos, revisar pedidos y operar el panel administrador.
- **mcsv-notificacion**: consume los eventos publicados por este servicio.
- **mcsv-inventario**: puede integrarse para registrar consumos o movimientos relacionados con pedidos.
- **mcsv-usuario**: se relaciona mediante el identificador del cliente asociado al pedido.

## Notas de seguridad

No subir credenciales reales de base de datos ni configuración sensible al repositorio. Usar variables de entorno para producción.
