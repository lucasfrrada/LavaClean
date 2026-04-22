package lavaclean.msvc_usuario.domain.model.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.*;

@Entity
@Table(name = "rol")
@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre_rol", nullable = false, unique = true)
    private String nombreRol;
}