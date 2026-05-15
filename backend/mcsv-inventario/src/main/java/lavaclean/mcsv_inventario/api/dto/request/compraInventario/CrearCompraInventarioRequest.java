package lavaclean.mcsv_inventario.api.dto.request.compraInventario;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lavaclean.mcsv_inventario.api.dto.request.detalleCompra.CrearDetalleCompraRequest;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CrearCompraInventarioRequest {

    @NotNull(message = "El proveedor es obligatorio")
    private  Long idProveedor;

    private LocalDate fechaCompra;

    private String observaciones;

    @Valid
    @NotEmpty(message = "La compra debe tener al menos un producto")
    private List<CrearDetalleCompraRequest> detalles;

}
