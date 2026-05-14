package lavaclean.auth.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAuthDTO {
    private Long idUsuario;
    private String correo;
    private String contrasenia; // Hash
    private String nombres;
    private String apPaterno;
    private Long telefono;
    private String rol;
}