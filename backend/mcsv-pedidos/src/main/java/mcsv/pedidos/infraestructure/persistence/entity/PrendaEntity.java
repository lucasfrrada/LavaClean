package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "prendas")
@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrendaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prenda")
    private Long idPrenda;

    @Column(name = "nombre_prenda")
    private String nombrePrenda;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "peso_referencia_kg", precision = 8, scale = 3)
    private BigDecimal pesoReferenciaKg;
}
