package mcsv.pedidos.api.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @Builder
public class PedidoResponse {

    private Long idPedido;
    private Long idUsuario;
    private String estado;
    private LocalDate fechaEntrega;
    private LocalDate fechaLlegada;
    private BigDecimal total;
    private List<DetallePedidoResponse> detalles;

}
