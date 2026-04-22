package lavaclean.msvc_usuario.api.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UsuarioResponde {

    private Long idUsuario;
    private Long idRol;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private String telefono;
}
