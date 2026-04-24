package lavaclean.msvc_usuario.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioRequest {
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Long telefono;
    private String contrasenia; // Solo en entrada viaja
    private Integer idRol;
}