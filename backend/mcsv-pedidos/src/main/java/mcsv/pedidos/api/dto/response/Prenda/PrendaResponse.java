package mcsv.pedidos.api.dto.response.Prenda;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrendaResponse {

    private Long idPrenda;
    private String nombrePrenda;
    private String categoria;
}