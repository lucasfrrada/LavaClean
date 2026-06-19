package mcsv.mcsv_notificacion.api.dto;

import lombok.Data;

@Data
public class UsuarioDTO {

    private Long idUsuario;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private String telefono;
    private String rol;
}