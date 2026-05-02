package mcsv.mcsv_notificacion.api.dto.request;

import lombok.Data;

@Data
public class NotificacionRequest {
    private Long idUsuario;
    private Long idPedido;
    private String tipoNotificacion;
    private String mensaje;
}
