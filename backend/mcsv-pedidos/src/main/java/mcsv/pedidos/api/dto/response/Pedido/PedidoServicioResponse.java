package mcsv.pedidos.api.dto.response.Pedido;

import lombok.Builder;
import lombok.Data;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;

import java.math.BigDecimal;

@Data
@Builder
public class PedidoServicioResponse {
    private Long idPedidoServicio;
    private Long idServicio;
    private String nombre;
    private TipoServicio tipo;
    private ModalidadCobro modalidadCobro;
    private String opcionCodigo;
    private String opcionNombre;
    private Integer cantidad;
    private String observaciones;
    private BigDecimal precioUnitario;
    private BigDecimal precioEstimado;
    private BigDecimal precioFinal;
}
