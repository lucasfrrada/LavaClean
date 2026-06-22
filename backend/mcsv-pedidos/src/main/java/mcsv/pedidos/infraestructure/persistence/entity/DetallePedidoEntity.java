package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_pedido")
@Setter @Getter
@AllArgsConstructor @NoArgsConstructor
@ToString
public class DetallePedidoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_pedido")
    private Long idDetallePedido;

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "peso_referencia_kg", precision = 8, scale = 3)
    private BigDecimal pesoReferenciaKg;

    @Column(name = "peso_estimado_kg", precision = 10, scale = 3)
    private BigDecimal pesoEstimadoKg;

    @Column(name = "precio_por_carga", precision = 12, scale = 2)
    private BigDecimal precioPorCarga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private PedidoEntity pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prenda", nullable = false)
    private PrendaEntity prenda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private ServicioEntity servicio;
}
