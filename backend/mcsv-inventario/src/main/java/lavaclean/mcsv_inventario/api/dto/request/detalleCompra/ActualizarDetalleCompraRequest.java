package lavaclean.mcsv_inventario.api.dto.request.detalleCompra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ActualizarDetalleCompraRequest {

    @Valid
    @NotEmpty(message = "La compra debe tener al menos un detalle")
    private List<CrearDetalleCompraRequest> detalles;

}
