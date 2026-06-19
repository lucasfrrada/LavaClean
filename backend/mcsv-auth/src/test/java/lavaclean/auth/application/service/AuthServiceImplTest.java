package lavaclean.auth.application.service;

import feign.FeignException;
import feign.Request;
import lavaclean.auth.api.dto.UsuarioAuthDTO;
import lavaclean.auth.api.dto.request.AuthRequest;
import lavaclean.auth.api.dto.response.AuthResponse;
import lavaclean.auth.infrastructure.client.UsuarioClient;
import lavaclean.auth.infrastructure.config.JWTService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private UsuarioAuthDTO usuario;
    private AuthRequest request;

    @BeforeEach
    void setUp() {
        usuario = UsuarioAuthDTO.builder()
                .idUsuario(1L)
                .nombres("Benjamín")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .contrasenia("hash-password")
                .rol("CLIENTE")
                .build();

        request = AuthRequest.builder()
                .correo("cliente@test.com")
                .contrasenia("password123")
                .build();
    }

    @Test
    void deberiaIniciarSesionCorrectamente() {
        when(usuarioClient.obtenerUsuarioPorCorreo("cliente@test.com")).thenReturn(usuario);
        when(passwordEncoder.matches("password123", "hash-password")).thenReturn(true);
        when(jwtService.generateToken(usuario)).thenReturn("jwt-token-test");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-test");
        assertThat(response.getMessage()).contains("Benjamín");
        assertThat(response.getIdUsuario()).isEqualTo(1L);
        assertThat(response.getNombres()).isEqualTo("Benjamín");
        assertThat(response.getApPaterno()).isEqualTo("Aranda");
        assertThat(response.getApMaterno()).isEqualTo("Test");
        assertThat(response.getCorreo()).isEqualTo("cliente@test.com");
        assertThat(response.getTelefono()).isEqualTo(999999999L);
        assertThat(response.getRol()).isEqualTo("CLIENTE");

        verify(usuarioClient).obtenerUsuarioPorCorreo("cliente@test.com");
        verify(passwordEncoder).matches("password123", "hash-password");
        verify(jwtService).generateToken(usuario);
    }

    @Test
    void deberiaLanzarBadCredentialsSiContraseniaEsIncorrecta() {
        when(usuarioClient.obtenerUsuarioPorCorreo("cliente@test.com")).thenReturn(usuario);
        when(passwordEncoder.matches("password123", "hash-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Correo o contraseña incorrectos");

        verify(usuarioClient).obtenerUsuarioPorCorreo("cliente@test.com");
        verify(passwordEncoder).matches("password123", "hash-password");
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void deberiaLanzarBadCredentialsSiUsuarioNoExiste() {
        when(usuarioClient.obtenerUsuarioPorCorreo("cliente@test.com"))
                .thenThrow(crearFeignNotFound());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Correo o contraseña incorrectos");

        verify(usuarioClient).obtenerUsuarioPorCorreo("cliente@test.com");
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void deberiaLanzarRuntimeExceptionSiFallaComunicacionConUsuario() {
        when(usuarioClient.obtenerUsuarioPorCorreo("cliente@test.com"))
                .thenThrow(new RuntimeException("Servicio usuario apagado"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error de comunicación con el servicio de usuarios");

        verify(usuarioClient).obtenerUsuarioPorCorreo("cliente@test.com");
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void deberiaGenerarTokenConUsuarioAdministrador() {
        UsuarioAuthDTO admin = UsuarioAuthDTO.builder()
                .idUsuario(2L)
                .nombres("Admin")
                .apPaterno("Lava")
                .apMaterno("Clean")
                .correo("admin@test.com")
                .telefono(888888888L)
                .contrasenia("hash-admin")
                .rol("ADMINISTRADOR")
                .build();

        AuthRequest adminRequest = AuthRequest.builder()
                .correo("admin@test.com")
                .contrasenia("admin123")
                .build();

        when(usuarioClient.obtenerUsuarioPorCorreo("admin@test.com")).thenReturn(admin);
        when(passwordEncoder.matches("admin123", "hash-admin")).thenReturn(true);
        when(jwtService.generateToken(admin)).thenReturn("jwt-token-admin");

        AuthResponse response = authService.login(adminRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token-admin");
        assertThat(response.getIdUsuario()).isEqualTo(2L);
        assertThat(response.getCorreo()).isEqualTo("admin@test.com");
        assertThat(response.getRol()).isEqualTo("ADMINISTRADOR");

        verify(usuarioClient).obtenerUsuarioPorCorreo("admin@test.com");
        verify(passwordEncoder).matches("admin123", "hash-admin");
        verify(jwtService).generateToken(admin);
    }

    private FeignException.NotFound crearFeignNotFound() {
        Request request = Request.create(
                Request.HttpMethod.GET,
                "/api/usuarios/correo/cliente@test.com",
                Map.of(),
                null,
                StandardCharsets.UTF_8,
                null
        );

        return new FeignException.NotFound(
                "Usuario no encontrado",
                request,
                null,
                Map.of()
        );
    }
}