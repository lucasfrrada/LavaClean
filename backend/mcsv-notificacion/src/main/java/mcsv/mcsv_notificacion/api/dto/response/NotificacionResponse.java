package mcsv.mcsv_notificacion.api.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificacionResponse {
    private Long idNotificacion;
    private String tipoNotificacion;
    private String mensaje;
    private Long idUsuario;
    private Long idPedido;
    private String estadoEnvio; // Ej: "PENDIENTE", "ENVIADO", "FALLIDO"
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;
}
