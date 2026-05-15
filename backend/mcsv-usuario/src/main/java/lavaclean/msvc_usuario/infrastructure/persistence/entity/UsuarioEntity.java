package lavaclean.msvc_usuario.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lavaclean.msvc_usuario.domain.enums.RolEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Entity
@Table(name = "usuario")
@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class UsuarioEntity {
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

    @NotBlank(message = "El correo no puede estar vacío")
    @Email(message = "El formato del correo electrónico no es válido")
    @Column(name = "correo", nullable = false, unique = true)
    private String correo;

    @Column(name = "telefono", nullable = false, unique = true)
    private Long telefono;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Column(nullable = false)
    private String contrasenia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolEnum rol;
}
