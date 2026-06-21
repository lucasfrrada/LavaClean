package mcsv.pedidos.api.dto.request.Pedido;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeleccionServicioRequest {
    @NotNull
    private Long idServicio;
    private String opcionCodigo;
    @Min(1)
    private Integer cantidad = 1;
    private String observaciones;
}
