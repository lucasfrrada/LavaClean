package lavaclean.mcsv_inventario.api.dto.response.compraInventario;

import lavaclean.mcsv_inventario.api.dto.response.detalleCompra.DetalleCompraResponse;
import lavaclean.mcsv_inventario.domain.model.EstadoCompra;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CompraInventarioResponse {

    private Long idCompraInventario;
    private Long idProveedor;
    private String nombreProveedor;
    private LocalDate fechaCompra;
    private BigDecimal total;
    private EstadoCompra estadoCompra;
    private String observaciones;
    private List<DetalleCompraResponse> detalles;


}
