package mcsv.pedidos.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
public class ActualizarDetallePedidoRequest {

    @NotNull
    private Long prendaId;

    @NotNull
    private Long servicioId;

    @NotNull
    @Min(1)
    private Integer cantidad;

    private String observaciones;
}