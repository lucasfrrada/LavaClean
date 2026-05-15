package lavaclean.auth.application.service;

import feign.FeignException;
import lavaclean.auth.api.dto.UsuarioAuthDTO;
import lavaclean.auth.api.dto.request.AuthRequest;
import lavaclean.auth.api.dto.response.AuthResponse;
import lavaclean.auth.infrastructure.client.UsuarioClient;
import lavaclean.auth.infrastructure.config.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{

    private final UsuarioClient usuarioClient;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    @Override
    public AuthResponse login(AuthRequest request) {
        UsuarioAuthDTO usuarioBd;

        // Paso 1: Pedirle los datos a msvc-usuario
        try {
            usuarioBd = usuarioClient.obtenerUsuarioPorCorreo(request.getCorreo());
        } catch (FeignException.NotFound e) {
            // Si el FeignClient recibe un Error 404 (El usuario no existe)
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        } catch (Exception e) {
            // Si el microservicio usuario está apagado o falla
            throw new RuntimeException("Error de comunicación con el servicio de usuarios");
        }

        // Paso 2: Comparar la contraseña ingresada con el Hash guardado en BD
        if (!passwordEncoder.matches(request.getContrasenia(), usuarioBd.getContrasenia())) {
            // ¡IMPORTANTE! Siempre dar el mismo mensaje de error para no revelar qué falló
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        // Paso 3: ¡Todo correcto! Generamos el JWT
        String token = jwtService.generateToken(usuarioBd);

        // Paso 4: Empaquetar y enviar al Frontend
        return new AuthResponse(
                token,
                "¡Hola " + usuarioBd.getNombres() + ", has iniciado sesión exitosamente!",
                usuarioBd.getIdUsuario(),
                usuarioBd.getNombres(),
                usuarioBd.getApPaterno(),
                usuarioBd.getApMaterno(),
                usuarioBd.getCorreo(),
                usuarioBd.getTelefono()
        );
    }

}