package lavaclean.msvc_usuario.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequest {
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Long telefono;
    private String contrasenia;
    private String rol;
}