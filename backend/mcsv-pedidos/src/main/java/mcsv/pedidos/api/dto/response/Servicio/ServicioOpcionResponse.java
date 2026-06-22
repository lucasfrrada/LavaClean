package mcsv.pedidos.api.dto.response.Servicio;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServicioOpcionResponse {
    private Long idServicioOpcion;
    private String codigo;
    private String nombre;
    private BigDecimal precio;
    private Boolean activo;
}
