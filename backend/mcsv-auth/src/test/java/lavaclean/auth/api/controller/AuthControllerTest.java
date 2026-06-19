package lavaclean.auth.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lavaclean.auth.api.dto.request.AuthRequest;
import lavaclean.auth.api.dto.response.AuthResponse;
import lavaclean.auth.application.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .build();

        objectMapper = new ObjectMapper();
    }

    @Test
    void deberiaIniciarSesionYRetornarStatus200() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .correo("cliente@test.com")
                .contrasenia("password123")
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-test")
                .message("¡Hola Benjamín, has iniciado sesión exitosamente!")
                .idUsuario(1L)
                .nombres("Benjamín")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .rol("CLIENTE")
                .build();

        when(authService.login(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-test"))
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.nombres").value("Benjamín"))
                .andExpect(jsonPath("$.correo").value("cliente@test.com"))
                .andExpect(jsonPath("$.telefono").value(999999999))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        verify(authService).login(any(AuthRequest.class));
    }

    @Test
    void deberiaIniciarSesionComoAdministradorYRetornarStatus200() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .correo("admin@test.com")
                .contrasenia("admin123")
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-admin")
                .message("¡Hola Admin, has iniciado sesión exitosamente!")
                .idUsuario(2L)
                .nombres("Admin")
                .apPaterno("Lava")
                .apMaterno("Clean")
                .correo("admin@test.com")
                .telefono(888888888L)
                .rol("ADMINISTRADOR")
                .build();

        when(authService.login(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-admin"))
                .andExpect(jsonPath("$.idUsuario").value(2))
                .andExpect(jsonPath("$.correo").value("admin@test.com"))
                .andExpect(jsonPath("$.rol").value("ADMINISTRADOR"));

        verify(authService).login(any(AuthRequest.class));
    }

    @Test
    void deberiaRetornarStatus400SiCorreoTieneFormatoInvalido() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .correo("correo-invalido")
                .contrasenia("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deberiaRetornarStatus400SiCorreoEstaVacio() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .correo("")
                .contrasenia("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deberiaRetornarStatus400SiContraseniaEstaVacia() throws Exception {
        AuthRequest request = AuthRequest.builder()
                .correo("cliente@test.com")
                .contrasenia("")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }


}