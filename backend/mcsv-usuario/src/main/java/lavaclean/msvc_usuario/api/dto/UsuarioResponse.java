package lavaclean.msvc_usuario.api.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UsuarioResponse {

    private Long idUsuario;
    private Long idRol;
    private String nombreCompleto;
    private String correo;
    private Long telefono;
}
