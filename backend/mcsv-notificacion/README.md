# mcsv-notificacion

Microservicio de notificaciones de **LavaClean**, desarrollado con **Spring Boot**. Su responsabilidad es enviar notificaciones asociadas a eventos importantes del sistema, principalmente cambios de estado de pedidos.

> Nota: en el repositorio la carpeta aparece como `mcsv-notificacion`, aunque funcionalmente corresponde al módulo de notificaciones.

## Resumen

`mcsv-notificacion` escucha eventos publicados por otros microservicios, especialmente `mcsv-pedidos`, y envía notificaciones al usuario correspondiente. El servicio está preparado para trabajar con Kafka y correo electrónico mediante configuración SMTP.

## Funcionalidades principales

- Consumo de eventos Kafka relacionados con pedidos.
- Envío de notificaciones por correo electrónico.
- Notificación ante cambios de estado de pedido.
- Consulta de información de usuario cuando se requiere complementar los datos de la notificación.
- Configuración mediante variables de entorno.

## Tecnologías utilizadas

- Java 21
- Spring Boot
- Spring Web
- Spring Kafka
- Spring Mail
- PostgreSQL
- Maven
- Lombok
- Dotenv

## Puerto por defecto

El puerto se configura mediante variable de entorno:

```env
PORT=8084
```

## Estructura general

```txt
mcsv-notificacion/
├── src/main/java/com/lavaclean/mcsv_notificacion/
│   ├── api/              # Controladores REST
│   ├── application/      # Casos de uso y lógica de notificación
│   ├── domain/           # Modelos y eventos del dominio
│   ├── infrastructure/   # Kafka, correo, persistencia y configuración
│   └── McsvNotificacionApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```

## Variables de entorno

Crear un archivo `.env` para ambiente local:

```env
PORT=8084
USUARIO_API_URL=http://localhost:8090

DB_URL=jdbc:postgresql://localhost:5432/lavaclean_notificaciones
DB_USERNAME=postgres
DB_PASSWORD=postgres

BREVO_SMTP_USERNAME=tu_usuario_smtp
BREVO_SMTP_KEY=tu_clave_smtp
MAIL_FROM=no-reply@lavaclean.cl

KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## Kafka

El servicio consume eventos desde el tópico:

```txt
pedido-estado-cambiado
```

Grupo consumidor:

```txt
mcsv-notificacion
```

## Ejecución local

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

## Relación con otros servicios

- **mcsv-pedidos**: publica eventos cuando cambia el estado de un pedido.
- **mcsv-usuario**: permite consultar datos del cliente para enviar la notificación.
- **frontend**: no necesariamente consume este servicio directamente, ya que normalmente las notificaciones se disparan por eventos internos.

## Notas de seguridad

No subir credenciales SMTP, claves de Brevo, contraseñas de base de datos ni archivos `.env` reales al repositorio.
