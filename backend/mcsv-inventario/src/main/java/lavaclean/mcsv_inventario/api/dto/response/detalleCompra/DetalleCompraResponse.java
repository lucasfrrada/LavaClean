package lavaclean.mcsv_inventario.api.dto.response.detalleCompra;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DetalleCompraResponse {

    private Long idDetalleCompra;
    private Long idProducto;
    private String nombreProducto;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

}
