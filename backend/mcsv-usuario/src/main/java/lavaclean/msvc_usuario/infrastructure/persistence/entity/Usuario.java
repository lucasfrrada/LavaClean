package lavaclean.msvc_usuario.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.Rol;
import lombok.*;

@Entity
@Table(name = "usuario")
@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "nombres")
    private String nombres;

    @Column(name = "ap_paterno")
    private String apPaterno;

    @Column(name = "ap_materno")
    private String apMaterno;

    @Column(name = "correo", nullable = false, unique = true)
    private String correo;

    @Column(name = "telefono", nullable = false, unique = true)
    private String telefono;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", referencedColumnName = "id_rol", nullable = false)
    private Rol rol;
}
