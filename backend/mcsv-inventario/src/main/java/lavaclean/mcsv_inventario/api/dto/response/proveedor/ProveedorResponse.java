package lavaclean.mcsv_inventario.api.dto.response.proveedor;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProveedorResponse {

    private Long idProveedor;
    private String nombreProveedor;
    private String telefono;
    private String correo;
    private String direccion;
    private String estado;

}
