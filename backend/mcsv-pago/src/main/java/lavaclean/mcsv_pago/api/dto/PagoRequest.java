package lavaclean.mcsv_pago.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoRequest {
    private String idPedido;
    private Long idUsuario;
    private Integer monto;
}
