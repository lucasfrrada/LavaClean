package mcsv.mcsv_notificacion.application.mapper;

import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;
import mcsv.mcsv_notificacion.infrastructure.persistence.entity.NotificacionEntity;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {

    public NotificacionResponse toResponse(NotificacionEntity entity) {
        if (entity == null) {
            return null;
        }

        NotificacionResponse response = new NotificacionResponse();
        response.setIdNotificacion(entity.getIdNotificacion());
        response.setTipoNotificacion(entity.getTipoNotificacion());
        response.setMensaje(entity.getMensaje());
        response.setIdUsuario(entity.getIdUsuario());
        response.setIdPedido(entity.getIdPedido());

        // Manejo seguro del Enum
        if (entity.getEstadoEnvio() != null) {
            response.setEstadoEnvio(entity.getEstadoEnvio().name());
        }

        response.setFechaCreacion(entity.getFechaCreacion());
        response.setFechaEnvio(entity.getFechaEnvio());

        return response;
    }
}