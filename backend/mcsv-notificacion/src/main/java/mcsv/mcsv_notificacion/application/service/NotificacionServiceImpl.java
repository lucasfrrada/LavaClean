package mcsv.mcsv_notificacion.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.mcsv_notificacion.api.dto.UsuarioDTO;
import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;
import mcsv.mcsv_notificacion.application.mapper.NotificacionMapper;
import mcsv.mcsv_notificacion.domain.EstadoNotificacion;
import mcsv.mcsv_notificacion.infrastructure.client.UsuarioClient;
import mcsv.mcsv_notificacion.infrastructure.mail.EmailSenderComponent;
import mcsv.mcsv_notificacion.infrastructure.persistence.entity.NotificacionEntity;
import mcsv.mcsv_notificacion.infrastructure.persistence.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioClient usuarioClient;
    private final EmailSenderComponent emailSender;
    private final NotificacionMapper notificacionMapper;

    @Override
    public NotificacionResponse crearYEnviarNotificacion(NotificacionRequest request) {
        log.info("Iniciando proceso de notificación para usuario ID:{}", request.getIdUsuario());

        NotificacionEntity entity = new NotificacionEntity();
        entity.setIdUsuario(request.getIdUsuario());
        entity.setIdPedido(request.getIdPedido());
        entity.setTipoNotificacion(request.getTipoNotificacion());
        entity.setMensaje(request.getMensaje());

        NotificacionEntity notificacionGuardada = notificacionRepository.save(entity);

        procesarEnvio(notificacionGuardada);

        return notificacionMapper.toResponse(notificacionGuardada);
    }

    @Override
    public List<NotificacionResponse> obtenerNotificacionesPorUsuario(Long idUsuario) {
        log.info("Consultando historial notificaciones por usuario ID:{}", idUsuario);
        List<NotificacionEntity> notificaciones = notificacionRepository.findByIdUsuarioOrderByFechaCreacionDesc(idUsuario);

        return notificaciones.stream()
                .map(notificacionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificacionResponse> obtenerNotificacionesPorPedido(Long idPedido) {
        log.info("Consultando notificacioes por pedido ID:{}", idPedido);
        List<NotificacionEntity> notificaciones = notificacionRepository.findByIdPedido(idPedido);

        return notificaciones.stream()
                .map(notificacionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void reintentarNotificacionesFallidas() {
        log.info("Buscando notificaciones fallidas por reintentar...");

        List<NotificacionEntity> fallidas = notificacionRepository.findByEstadoEnvio(EstadoNotificacion.FALLIDO);

        if (fallidas.isEmpty()) {
            log.info("No hay notificaciones fallidas por procesar");
            return;
        }

        for (NotificacionEntity notificacion : fallidas) {
            log.info("Reintentando notificacion ID:{}", notificacion.getIdNotificacion());
            procesarEnvio(notificacion);
        }
    }

    // --- METODOS AUXILIARES ---
    private void procesarEnvio(NotificacionEntity notificacion) {
        try {
            // Rescatar Email usando Feign
            UsuarioDTO usuario = usuarioClient.obtenerUsuarioPorId(notificacion.getIdUsuario());

            // Enviar correo usando Brevo
            String asunto = "Novedades en tu pedido LavaClean!";
            emailSender.enviarCorreoTextoPlano(usuario.getEmail(), asunto, notificacion.getMensaje());

            // Si no explotó, se envió con éxito
            notificacion.setEstadoEnvio(EstadoNotificacion.ENVIADO);
            notificacion.setFechaEnvio(LocalDateTime.now());

            log.info("Notificación con ID:{} enviada con éxito a {}", notificacion.getIdNotificacion(), usuario.getEmail());

        } catch (Exception e) {
            notificacion.setEstadoEnvio(EstadoNotificacion.FALLIDO);
            log.error("Fallo al enviar la notificación ID:{}. Causa: {}", notificacion.getIdNotificacion(), e.getMessage());
        }

        notificacionRepository.save(notificacion);
    }

}
