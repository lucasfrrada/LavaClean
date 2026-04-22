package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "servicios")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@ToString
public class ServicioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServcio;

    @Column(name = "tipo_servicio")
    private String tipoServicio;

    @Column(name = "precio")
    private BigDecimal precio;
}
