package mcsv.mcsv_notificacion.api.dto;

import lombok.Data;

@Data 
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String correo;
}
