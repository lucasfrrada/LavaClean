package lavaclean.mcsv_inventario.api.dto.request.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearProveedorRequest {

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    private String nombreProveedor;
    private String direccion;
    private String telefono;
    @Email(message = "El correo no tiene un formato válido")
    private String correo;

}
