package lavaclean.mcsv_inventario.api.dto.request.movimientoInventario;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lavaclean.mcsv_inventario.domain.model.TipoMovimientoInventario;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CrearMovimientoInventarioRequest {

    @NotNull(message = "El producto es obligatorio")
    private Long idProducto;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimientoInventario tipoMovimiento;

    @NotNull(message = "La cantidad es obligatoria")
    @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidad;

    private String motivo;

}
