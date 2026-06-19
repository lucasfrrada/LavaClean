package mcsv.mcsv_notificacion.infrastructure.messaging;

import java.time.LocalDateTime;
import java.util.UUID;

public record PedidoEstadoCambiadoEvent(
        UUID eventId,
        Long idPedido,
        Long idUsuario,
        String estado,
        String tipoNotificacion,
        String mensaje,
        LocalDateTime fechaEvento
) {}