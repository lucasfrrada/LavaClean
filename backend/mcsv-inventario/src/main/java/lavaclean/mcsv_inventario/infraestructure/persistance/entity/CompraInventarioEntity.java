package lavaclean.mcsv_inventario.infraestructure.persistance.entity;

import jakarta.persistence.*;
import lavaclean.mcsv_inventario.domain.model.EstadoCompra;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compra_inventario")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraInventarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra_inventario")
    private Long idCompraInventario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private ProveedorEntity idProveedor;

    @Column(name = "fecha_compra")
    private LocalDate fechaCompra;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_compra")
    private EstadoCompra estadoCompra;

    @Column(name = "observaciones")
    private String observaciones;

    @OneToMany(
            mappedBy = "compraInventario",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<DetalleCompraInventarioEntity> detalles = new ArrayList<>();

    @OneToMany(mappedBy = "compraInventario")
    @Builder.Default
    private List<MovimientoInventarioEntity> movimientos = new ArrayList<>();
}
