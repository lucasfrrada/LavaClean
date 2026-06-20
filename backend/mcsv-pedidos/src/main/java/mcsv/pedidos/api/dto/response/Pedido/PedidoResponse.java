package mcsv.pedidos.api.dto.response.Pedido;

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
    private BigDecimal pesoEstimadoKg;
    private BigDecimal pesoRealKg;
    private BigDecimal precioEstimado;
    private BigDecimal precioFinal;
    private BigDecimal precioPorCarga;
    private Integer cargasEstimadas;
    private Integer cargasReales;
    private List<DetallePedidoResponse> detalles;

}
