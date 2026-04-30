package mcsv.pedidos.api.dto.response;

import lombok.Data;

@Data
public class UsuarioResponseRest {
    private Long idUsuario;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Long telefono;
}
