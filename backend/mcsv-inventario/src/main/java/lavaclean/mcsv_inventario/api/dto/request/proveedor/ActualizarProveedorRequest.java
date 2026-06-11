package lavaclean.mcsv_inventario.api.dto.request.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ActualizarProveedorRequest {

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    private String nombreProveedor;
    private String direccionProveedor;
    private String telefonoProveedor;
    @Email(message = "El correo tiene que tener un formato válido")
    private String correoProveedor;
    private String estadoProveedor;

}
