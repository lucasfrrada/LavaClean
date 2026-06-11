package lavaclean.mcsv_inventario.api.dto.response.movimientoInventario;

import lavaclean.mcsv_inventario.domain.model.TipoMovimientoInventario;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MovimientoInventarioResponse {

    private Long idMovimiento;
    private Long idProducto;
    private String nombreProducto;
    private Long idCompraInventario;
    private TipoMovimientoInventario tipoMovimiento;
    private BigDecimal cantidad;
    private BigDecimal stockAnterior;
    private BigDecimal stockNuevo;
    private LocalDateTime fechaMovimiento;
    private String motivo;

}
