package mcsv.pedidos.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ActualizarPedidoRequest {

    private LocalDate fecha_entrega;
    private LocalDate fecha_llegada;

    @Valid
    @NotEmpty
    private List<ActualizarDetallePedidoRequest> detalles;

}
