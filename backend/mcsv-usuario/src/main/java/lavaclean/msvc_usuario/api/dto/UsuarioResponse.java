package lavaclean.msvc_usuario.api.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UsuarioResponse {

    private Long idUsuario;
    private String rol;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Long telefono;
}
