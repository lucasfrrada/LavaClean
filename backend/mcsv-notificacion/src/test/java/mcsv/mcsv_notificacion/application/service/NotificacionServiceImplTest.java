package mcsv.mcsv_notificacion.application.service;

import mcsv.mcsv_notificacion.api.dto.UsuarioDTO;
import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;
import mcsv.mcsv_notificacion.application.mapper.NotificacionMapper;
import mcsv.mcsv_notificacion.domain.EstadoNotificacion;
import mcsv.mcsv_notificacion.infrastructure.client.UsuarioClient;
import mcsv.mcsv_notificacion.infrastructure.mail.EmailSenderComponent;
import mcsv.mcsv_notificacion.infrastructure.persistence.entity.NotificacionEntity;
import mcsv.mcsv_notificacion.infrastructure.persistence.repository.NotificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceImplTest {

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private EmailSenderComponent emailSender;

    @Mock
    private NotificacionMapper notificacionMapper;

    @InjectMocks
    private NotificacionServiceImpl notificacionService;

    private NotificacionRequest request;
    private UsuarioDTO usuario;

    @BeforeEach
    void setUp() {
        request = new NotificacionRequest();
        request.setIdUsuario(1L);
        request.setIdPedido(10L);
        request.setTipoNotificacion("CAMBIO_ESTADO");
        request.setMensaje("Tu pedido #10 está en proceso.");

        usuario = new UsuarioDTO();
        usuario.setIdUsuario(1L);
        usuario.setNombres("Lucas");
        usuario.setCorreo("cliente@lavaclean.cl");
    }

    @Test
    void deberiaCrearEnviarYMarcarNotificacionComoEnviada() {
        NotificacionResponse respuestaEsperada =
                mock(NotificacionResponse.class);

        when(notificacionRepository.save(any(NotificacionEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(usuarioClient.obtenerUsuarioPorId(1L))
                .thenReturn(usuario);

        when(notificacionMapper.toResponse(any(NotificacionEntity.class)))
                .thenReturn(respuestaEsperada);

        NotificacionResponse resultado =
                notificacionService.crearYEnviarNotificacion(request);

        ArgumentCaptor<NotificacionEntity> captor =
                ArgumentCaptor.forClass(NotificacionEntity.class);

        verify(notificacionRepository, times(2))
                .save(captor.capture());

        NotificacionEntity notificacionFinal =
                captor.getAllValues().get(1);

        assertSame(respuestaEsperada, resultado);
        assertEquals(
                EstadoNotificacion.ENVIADO,
                notificacionFinal.getEstadoEnvio()
        );
        assertNotNull(notificacionFinal.getFechaEnvio());

        verify(usuarioClient).obtenerUsuarioPorId(1L);

        verify(emailSender).enviarCorreoTextoPlano(
                "cliente@lavaclean.cl",
                "Novedades en tu pedido LavaClean!",
                "Tu pedido #10 está en proceso."
        );
    }

    @Test
    void deberiaMarcarNotificacionComoFallidaSiFallaElEnvio() {
        NotificacionResponse respuestaEsperada =
                mock(NotificacionResponse.class);

        when(notificacionRepository.save(any(NotificacionEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(usuarioClient.obtenerUsuarioPorId(1L))
                .thenReturn(usuario);

        doThrow(new RuntimeException("Error enviando correo"))
                .when(emailSender)
                .enviarCorreoTextoPlano(
                        anyString(),
                        anyString(),
                        anyString()
                );

        when(notificacionMapper.toResponse(any(NotificacionEntity.class)))
                .thenReturn(respuestaEsperada);

        NotificacionResponse resultado =
                notificacionService.crearYEnviarNotificacion(request);

        ArgumentCaptor<NotificacionEntity> captor =
                ArgumentCaptor.forClass(NotificacionEntity.class);

        verify(notificacionRepository, times(2))
                .save(captor.capture());

        NotificacionEntity notificacionFinal =
                captor.getAllValues().get(1);

        assertSame(respuestaEsperada, resultado);
        assertEquals(
                EstadoNotificacion.FALLIDO,
                notificacionFinal.getEstadoEnvio()
        );
        assertNull(notificacionFinal.getFechaEnvio());

        verify(emailSender).enviarCorreoTextoPlano(
                "cliente@lavaclean.cl",
                "Novedades en tu pedido LavaClean!",
                "Tu pedido #10 está en proceso."
        );
    }
}