package mcsv.pedidos.api.dto.request.Notificaciones;

import jakarta.validation.constraints.NotBlank;

public record NotificacionRequest(
        Long idUsuario,
        Long idPedido,
        String tipoNotificacion,
        String mensaje
) {
}

