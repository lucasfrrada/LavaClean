package mcsv.pedidos.api.dto.response.Prenda;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PrendaResponse {

    private Long idPrenda;
    private String nombrePrenda;
    private String categoria;
    private BigDecimal pesoReferenciaKg;
}
