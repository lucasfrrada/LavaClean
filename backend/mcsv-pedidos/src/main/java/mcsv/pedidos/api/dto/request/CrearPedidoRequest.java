package mcsv.pedidos.api.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CrearPedidoRequest {

    @NotNull
    private Long idUsuario;

    private LocalDate fecha_entrega;
    private LocalDate fecha_llegada;

    @Valid
    @NotEmpty
    private List<CrearDetallePedidoRequest> detalles;

}
