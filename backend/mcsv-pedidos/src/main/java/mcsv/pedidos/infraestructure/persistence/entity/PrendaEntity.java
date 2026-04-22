package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prendas")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PrendaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prenda")
    private Long idPrenda;

    @Column(name = "nombre_prenda")
    private String nombre_prenda;

    @Column(name = "categoria")
    private String categoria;
}
