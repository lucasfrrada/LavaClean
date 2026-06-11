package lavaclean.auth.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class AuthRequest {

    @NotBlank(message = "El campo no puede estar vacio")
    @Email(message = "Debe ser un formato de correo valido (ejemplo@lavaclean.com)")
    private String correo;


    @NotBlank(message = "El campo no puede estar vacio")
    @Size(min = 6, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasenia;
}
