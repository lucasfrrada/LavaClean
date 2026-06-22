package mcsv.pedidos.api.dto.request.Pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AgregarServiciosExtrasRequest {
    @Valid
    @NotEmpty
    private List<SeleccionServicioRequest> serviciosExtras;
}
