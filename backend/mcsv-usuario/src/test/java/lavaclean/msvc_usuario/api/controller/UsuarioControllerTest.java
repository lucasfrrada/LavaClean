package lavaclean.msvc_usuario.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.service.UsuarioService;
import lavaclean.msvc_usuario.domain.enums.RolEnum;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private UsuarioService usuarioService;

    private UsuarioEntity usuario;

    @BeforeEach
    void setUp() {
        UsuarioController usuarioController = new UsuarioController(usuarioService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(usuarioController)
                .build();

        objectMapper = new ObjectMapper();

        usuario = new UsuarioEntity();
        usuario.setIdUsuario(1L);
        usuario.setNombres("Benjamín");
        usuario.setApPaterno("Aranda");
        usuario.setApMaterno("Test");
        usuario.setCorreo("cliente@test.com");
        usuario.setTelefono(999999999L);
        usuario.setContrasenia("hash-password");
        usuario.setRol(RolEnum.CLIENTE);
    }

    @Test
    void deberiaListarUsuariosYRetornarStatus200() throws Exception {
        UsuarioResponse usuario1 = UsuarioResponse.builder()
                .idUsuario(1L)
                .nombres("Benjamín Aranda")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .rol("CLIENTE")
                .build();

        UsuarioResponse usuario2 = UsuarioResponse.builder()
                .idUsuario(2L)
                .nombres("Admin Lava")
                .apPaterno("Lava")
                .apMaterno("Clean")
                .correo("admin@test.com")
                .telefono(888888888L)
                .rol("ADMINISTRADOR")
                .build();

        when(usuarioService.findAll()).thenReturn(List.of(usuario1, usuario2));

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idUsuario").value(1))
                .andExpect(jsonPath("$[0].correo").value("cliente@test.com"))
                .andExpect(jsonPath("$[0].rol").value("CLIENTE"))
                .andExpect(jsonPath("$[1].idUsuario").value(2))
                .andExpect(jsonPath("$[1].correo").value("admin@test.com"))
                .andExpect(jsonPath("$[1].rol").value("ADMINISTRADOR"));

        verify(usuarioService).findAll();
    }

    @Test
    void deberiaRegistrarUsuarioYRetornarStatus201() throws Exception {
        UsuarioRequest request = UsuarioRequest.builder()
                .nombres("Benjamín")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .contrasenia("password123")
                .rol("CLIENTE")
                .build();

        when(usuarioService.registrarUsuario(any(UsuarioRequest.class))).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.correo").value("cliente@test.com"))
                .andExpect(jsonPath("$.telefono").value(999999999))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        verify(usuarioService).registrarUsuario(any(UsuarioRequest.class));
    }

    @Test
    void deberiaActualizarUsuarioYRetornarStatus200() throws Exception {
        UsuarioRequest request = UsuarioRequest.builder()
                .nombres("Benjamín Actualizado")
                .apPaterno("Nuevo")
                .apMaterno("Apellido")
                .correo("cliente@test.com")
                .telefono(777777777L)
                .contrasenia("password123")
                .rol("CLIENTE")
                .build();

        UsuarioEntity actualizado = new UsuarioEntity();
        actualizado.setIdUsuario(1L);
        actualizado.setNombres("Benjamín Actualizado");
        actualizado.setApPaterno("Nuevo");
        actualizado.setApMaterno("Apellido");
        actualizado.setCorreo("cliente@test.com");
        actualizado.setTelefono(777777777L);
        actualizado.setContrasenia("hash-password");
        actualizado.setRol(RolEnum.CLIENTE);

        when(usuarioService.update(eq(1L), any(UsuarioEntity.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/usuarios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.correo").value("cliente@test.com"))
                .andExpect(jsonPath("$.telefono").value(777777777))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        verify(usuarioService).update(eq(1L), any(UsuarioEntity.class));
    }

    @Test
    void deberiaEliminarUsuarioYRetornarStatus204() throws Exception {
        doNothing().when(usuarioService).deleteById(1L);

        mockMvc.perform(delete("/api/usuarios/1"))
                .andExpect(status().isNoContent());

        verify(usuarioService).deleteById(1L);
    }

    @Test
    void deberiaBuscarUsuarioPorIdYRetornarStatus200() throws Exception {
        when(usuarioService.findById(1L)).thenReturn(usuario);

        mockMvc.perform(get("/api/usuarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.correo").value("cliente@test.com"))
                .andExpect(jsonPath("$.telefono").value(999999999))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));

        verify(usuarioService).findById(1L);
    }

    @Test
    void deberiaBuscarUsuarioPorCorreoYRetornarStatus200() throws Exception {
        when(usuarioService.findByCorreo("cliente@test.com")).thenReturn(Optional.of(usuario));

        mockMvc.perform(get("/api/usuarios/correo/cliente@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.correo").value("cliente@test.com"))
                .andExpect(jsonPath("$.telefono").value(999999999));

        verify(usuarioService).findByCorreo("cliente@test.com");
    }

    @Test
    void deberiaRetornarStatus404SiCorreoNoExiste() throws Exception {
        when(usuarioService.findByCorreo("noexiste@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/usuarios/correo/noexiste@test.com"))
                .andExpect(status().isNotFound());

        verify(usuarioService).findByCorreo("noexiste@test.com");
    }
}