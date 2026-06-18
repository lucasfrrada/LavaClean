package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.domain.enums.RolEnum;
import lavaclean.msvc_usuario.domain.exception.UsuarioException;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import lavaclean.msvc_usuario.infrastructure.persistence.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    private UsuarioEntity usuario;

    @BeforeEach
    void setUp() {
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
    void deberiaBuscarUsuarioPorId() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        UsuarioEntity response = usuarioService.findById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getIdUsuario()).isEqualTo(1L);
        assertThat(response.getCorreo()).isEqualTo("cliente@test.com");
        assertThat(response.getRol()).isEqualTo(RolEnum.CLIENTE);

        verify(usuarioRepository).findById(1L);
    }

    @Test
    void deberiaLanzarErrorSiUsuarioNoExisteAlBuscarPorId() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.findById(99L))
                .isInstanceOf(UsuarioException.class)
                .hasMessageContaining("Usuario con id 99 no encontrado en el sistema.");

        verify(usuarioRepository).findById(99L);
    }

    @Test
    void deberiaListarUsuarios() {
        UsuarioEntity admin = new UsuarioEntity();
        admin.setIdUsuario(2L);
        admin.setNombres("Admin");
        admin.setApPaterno("Lava");
        admin.setApMaterno("Clean");
        admin.setCorreo("admin@test.com");
        admin.setTelefono(888888888L);
        admin.setContrasenia("hash-admin");
        admin.setRol(RolEnum.ADMINISTRADOR);

        when(usuarioRepository.findAll()).thenReturn(List.of(usuario, admin));

        List<UsuarioResponse> response = usuarioService.findAll();

        assertThat(response).hasSize(2);

        assertThat(response.get(0).getIdUsuario()).isEqualTo(1L);
        assertThat(response.get(0).getCorreo()).isEqualTo("cliente@test.com");
        assertThat(response.get(0).getRol()).isEqualTo("CLIENTE");

        assertThat(response.get(1).getIdUsuario()).isEqualTo(2L);
        assertThat(response.get(1).getCorreo()).isEqualTo("admin@test.com");
        assertThat(response.get(1).getRol()).isEqualTo("ADMINISTRADOR");

        verify(usuarioRepository).findAll();
    }

    @Test
    void deberiaRegistrarUsuarioConRolClienteYContraseniaCifrada() {
        UsuarioRequest request = UsuarioRequest.builder()
                .nombres("Benjamín")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .contrasenia("password123")
                .rol("ADMINISTRADOR")
                .build();

        when(usuarioRepository.findByCorreo("cliente@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hash-password");

        when(usuarioRepository.save(any(UsuarioEntity.class))).thenAnswer(invocation -> {
            UsuarioEntity usuarioGuardado = invocation.getArgument(0);
            usuarioGuardado.setIdUsuario(1L);
            return usuarioGuardado;
        });

        UsuarioEntity response = usuarioService.registrarUsuario(request);

        assertThat(response).isNotNull();
        assertThat(response.getIdUsuario()).isEqualTo(1L);
        assertThat(response.getCorreo()).isEqualTo("cliente@test.com");
        assertThat(response.getContrasenia()).isEqualTo("hash-password");
        assertThat(response.getRol()).isEqualTo(RolEnum.CLIENTE);

        ArgumentCaptor<UsuarioEntity> usuarioCaptor = ArgumentCaptor.forClass(UsuarioEntity.class);
        verify(usuarioRepository).save(usuarioCaptor.capture());

        UsuarioEntity usuarioGuardado = usuarioCaptor.getValue();

        assertThat(usuarioGuardado.getRol()).isEqualTo(RolEnum.CLIENTE);
        assertThat(usuarioGuardado.getContrasenia()).isEqualTo("hash-password");
    }

    @Test
    void noDeberiaRegistrarUsuarioSiCorreoYaExiste() {
        UsuarioRequest request = UsuarioRequest.builder()
                .nombres("Benjamín")
                .apPaterno("Aranda")
                .apMaterno("Test")
                .correo("cliente@test.com")
                .telefono(999999999L)
                .contrasenia("password123")
                .rol("CLIENTE")
                .build();

        when(usuarioRepository.findByCorreo("cliente@test.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> usuarioService.registrarUsuario(request))
                .isInstanceOf(UsuarioException.class)
                .hasMessageContaining("El correo cliente@test.com ya se encuentra registrado.");

        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void deberiaActualizarDatosDelUsuario() {
        UsuarioEntity datosActualizados = new UsuarioEntity();
        datosActualizados.setNombres("Benjamín Actualizado");
        datosActualizados.setApPaterno("Nuevo");
        datosActualizados.setApMaterno("Apellido");
        datosActualizados.setTelefono(777777777L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(UsuarioEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioEntity response = usuarioService.update(1L, datosActualizados);

        assertThat(response.getNombres()).isEqualTo("Benjamín Actualizado");
        assertThat(response.getApPaterno()).isEqualTo("Nuevo");
        assertThat(response.getApMaterno()).isEqualTo("Apellido");
        assertThat(response.getTelefono()).isEqualTo(777777777L);

        assertThat(response.getCorreo()).isEqualTo("cliente@test.com");
        assertThat(response.getRol()).isEqualTo(RolEnum.CLIENTE);

        verify(usuarioRepository).findById(1L);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void deberiaLanzarErrorSiUsuarioNoExisteAlActualizar() {
        UsuarioEntity datosActualizados = new UsuarioEntity();
        datosActualizados.setNombres("Benjamín Actualizado");

        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.update(99L, datosActualizados))
                .isInstanceOf(UsuarioException.class)
                .hasMessageContaining("Usuario con id 99 no encontrado");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void deberiaEliminarUsuarioCorrectamente() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        usuarioService.deleteById(1L);

        verify(usuarioRepository).findById(1L);
        verify(usuarioRepository).delete(usuario);
    }

    @Test
    void deberiaBuscarUsuarioPorCorreo() {
        when(usuarioRepository.findByCorreo("cliente@test.com")).thenReturn(Optional.of(usuario));

        Optional<UsuarioEntity> response = usuarioService.findByCorreo("cliente@test.com");

        assertThat(response).isPresent();
        assertThat(response.get().getCorreo()).isEqualTo("cliente@test.com");

        verify(usuarioRepository).findByCorreo("cliente@test.com");
    }

    @Test
    void deberiaAsignarRolAdministrador() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(UsuarioEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioEntity response = usuarioService.asignarRol(1L, "ADMINISTRADOR");

        assertThat(response.getRol()).isEqualTo(RolEnum.ADMINISTRADOR);

        verify(usuarioRepository).findById(1L);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void deberiaLanzarErrorSiRolNoExiste() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> usuarioService.asignarRol(1L, "SUPER_ADMIN"))
                .isInstanceOf(UsuarioException.class)
                .hasMessageContaining("El Rol 'SUPER_ADMIN' no existe.");

        verify(usuarioRepository, never()).save(any());
    }
}