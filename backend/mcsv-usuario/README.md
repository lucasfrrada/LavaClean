# mcsv-usuario

Microservicio de usuarios de **LavaClean**, desarrollado con **Spring Boot** y **PostgreSQL**. Su responsabilidad es administrar la información de clientes y usuarios del sistema.

## Resumen

`mcsv-usuario` permite registrar, consultar, actualizar y eliminar usuarios. Es utilizado por el frontend para el registro y la administración de clientes, y por `mcsv-auth` para validar credenciales durante el inicio de sesión.

## Funcionalidades principales

- Registro de usuarios.
- Consulta de usuarios.
- Actualización de datos de usuario.
- Eliminación de usuarios.
- Gestión de datos personales del cliente.
- Soporte para roles de usuario.
- Integración con autenticación.

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
8090
```

## Estructura general

```txt
mcsv-usuario/
├── src/main/java/lavaclean/msvc_usuario/
│   ├── api/              # Controladores REST
│   ├── application/      # Casos de uso y lógica de negocio
│   ├── domain/           # Entidades y reglas del dominio
│   ├── infrastructure/   # Persistencia, configuración y adaptadores
│   └── MsvcUsuarioApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```

## Variables recomendadas para entorno local

Se recomienda no dejar credenciales reales en `application.properties`. Una alternativa segura es usar variables de entorno:

```env
DB_URL=jdbc:postgresql://localhost:5432/lavaclean_usuarios
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## Configuración base esperada

```properties
spring.application.name=msvc-usuarioEntity
server.port=8090
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
GET    /usuarios
POST   /usuarios
GET    /usuarios/{id}
PUT    /usuarios/{id}
DELETE /usuarios/{id}
```

## Relación con otros servicios

- **mcsv-auth**: consulta usuarios para validar credenciales.
- **frontend**: consume este servicio para registro, edición de perfil y administración de clientes.
- **mcsv-notificacion**: puede consultar datos de usuario para enviar notificaciones asociadas a pedidos.

## Notas de seguridad

No subir usuarios, contraseñas o cadenas de conexión reales al repositorio. Usar variables de entorno para despliegues locales y productivos.
