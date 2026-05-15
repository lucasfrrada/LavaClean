package lavaclean.auth.infrastructure.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lavaclean.auth.api.dto.UsuarioAuthDTO;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JWTService {
    private static final String SECRET_STRING = "LavaCleanSuperSecretaClaveParaCifrarTokens2026!!";
    public static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    public static final String JWT_TOKEN_PREFIX = "Bearer ";

    // Tiempo de expiración: 1 hora
    private static final long EXPIRATION_TIME = 3600000;

    // Metodo para recibir UsuarioAuthDTO directamente
    public String generateToken(UsuarioAuthDTO usuario) {
        return Jwts.builder()

                .setSubject(usuario.getCorreo())

                // Guardamos datos extra
                .claim("rol", usuario.getRol())
                .claim("idUsuario", usuario.getIdUsuario())

                // Fechas de emisión y expiración
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))

                // Firmamos con nuestra llave secreta fija
                .signWith(SECRET_KEY)
                .compact();
    }
}
