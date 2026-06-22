package mcsv.pedidos.api.dto.response.Pedido;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data @Builder
public class DetallePedidoResponse {

    private Long idPedido;
    private String prenda;
    private String categoriaPrenda;
    private String servicio;
    private Integer cantidad;
    private String observaciones;
    private BigDecimal pesoReferenciaKg;
    private BigDecimal pesoEstimadoKg;
    private BigDecimal precioPorCarga;

}
