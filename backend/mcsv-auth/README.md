# mcsv-auth

Microservicio de autenticación de **LavaClean**, desarrollado con **Spring Boot**. Su responsabilidad principal es validar credenciales de usuario y generar tokens JWT para proteger el acceso al sistema.

## Resumen

`mcsv-auth` centraliza el inicio de sesión de la plataforma. El frontend envía las credenciales del usuario a este servicio, el cual valida la información contra el microservicio de usuarios y responde con un token JWT cuando el login es correcto.

## Funcionalidades principales

- Inicio de sesión de usuarios.
- Validación de credenciales.
- Generación de token JWT.
- Integración con el microservicio `mcsv-usuario`.
- Soporte para roles de usuario, como cliente y administrador.
- Base para proteger rutas y operaciones del frontend.

## Tecnologías utilizadas

- Java 21
- Spring Boot
- Spring Security
- Spring Web
- Spring Cloud OpenFeign
- JWT / JJWT
- Maven
- Lombok

## Puerto por defecto

```txt
8091
```

## Estructura general

```txt
mcsv-auth/
├── src/main/java/lavaclean/auth/
│   ├── api/                  # Controladores REST
│   ├── application/service/  # Lógica de autenticación
│   ├── infrastructure/       # Configuración, seguridad e integraciones
│   └── AuthApplication.java
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── README.md
```

## Configuración base

El servicio utiliza configuración local mediante `application.properties`.

Ejemplo:

```properties
spring.application.name=auth
server.port=8091
spring.cloud.config.enabled=false
```

## Ejecución local

Desde la carpeta del microservicio:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

## Endpoint principal

```txt
POST /auth/login
```

Este endpoint recibe las credenciales del usuario y devuelve la información necesaria para mantener la sesión autenticada desde el frontend.

## Relación con otros servicios

- **mcsv-usuario**: se utiliza para validar los datos del usuario al iniciar sesión.
- **frontend**: consume este servicio durante el login y almacena el token JWT para futuras peticiones.

## Notas de seguridad

No exponer claves JWT, secretos ni configuraciones sensibles directamente en el repositorio. Para producción, usar variables de entorno o un gestor de secretos.
