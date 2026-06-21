package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import mcsv.pedidos.domain.model.TipoServicio;

import java.math.BigDecimal;

@Entity
@Table(name = "pedido_servicios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoServicioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido_servicio")
    private Long idPedidoServicio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_pedido", nullable = false)
    private PedidoEntity pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_servicio", nullable = false)
    private ServicioEntity servicio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoServicio tipo;

    @Column(name = "opcion_codigo", length = 80)
    private String opcionCodigo;

    @Column(name = "opcion_nombre")
    private String opcionNombre;

    @Column(name = "cantidad", nullable = false)
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "precio_estimado", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioEstimado;

    @Column(name = "precio_final", precision = 12, scale = 2)
    private BigDecimal precioFinal;
}
