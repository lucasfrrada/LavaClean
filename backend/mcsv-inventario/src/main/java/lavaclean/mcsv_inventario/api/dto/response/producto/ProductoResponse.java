package lavaclean.mcsv_inventario.api.dto.response.producto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductoResponse {

    private Long idProducto;
    private String nombreProducto;
    private String descripcion;
    private BigDecimal stock;
    private BigDecimal stockMinimo;
    private String unidadMedida;
    private String estado;
}