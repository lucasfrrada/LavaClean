package mcsv.pedidos.api.dto.response.Servicio;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServicioResponse {

    private Long idServicio;
    private String tipoServicio;
    private BigDecimal precio;
}