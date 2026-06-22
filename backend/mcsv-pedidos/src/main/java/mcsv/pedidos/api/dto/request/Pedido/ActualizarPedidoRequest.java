package mcsv.pedidos.api.dto.request.Pedido;

import jakarta.validation.Valid;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Data
public class ActualizarPedidoRequest {

    private LocalDate fecha_entrega;
    private LocalDate fecha_llegada;

    @Valid
    private Long idServicioBase;
    private String opcionBaseCodigo;
    private String observacionesServicioBase;
    private String observacionesCliente;
    private String observacionesInternas;

    private List<ActualizarDetallePedidoRequest> detalles = new ArrayList<>();

    @Valid
    private List<SeleccionServicioRequest> serviciosExtras = new ArrayList<>();

}
