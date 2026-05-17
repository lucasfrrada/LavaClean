package lavaclean.mcsv_pago.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoResponse {
    private Long idPago;
    private String idPedido;
    private Long idUsuario;
    private Integer monto;
    private String estadoPago;
    private String urlPago;
    private LocalDateTime fechaCreacion;
}
