package mcsv.pedidos.api.dto.request.Pedido;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearDetallePedidoRequest {

    @NotNull
    private Long idPrenda;

    private Long idServicio;

    @NotNull
    @Min(1)
    private Integer cantidad;

    private String observaciones;
}
