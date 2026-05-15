package mcsv.pedidos.domain.model;

import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class Usuario {

    private Long idUsuario;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Integer telefono;
}
