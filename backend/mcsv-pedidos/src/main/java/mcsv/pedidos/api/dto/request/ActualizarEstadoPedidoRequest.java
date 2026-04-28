package mcsv.pedidos.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mcsv.pedidos.domain.model.EstadoPedido;

@Data
public class ActualizarEstadoPedidoRequest {

    @NotNull
    private EstadoPedido estado;
}