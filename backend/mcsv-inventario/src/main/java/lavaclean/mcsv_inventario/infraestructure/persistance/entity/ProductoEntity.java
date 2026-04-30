package lavaclean.mcsv_inventario.infraestructure.persistance.entity;

import jakarta.persistence.*;
import lavaclean.mcsv_inventario.domain.model.EstadoProducto;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "productos")
@Getter @Setter
@ToString
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private int idProducto;

    @Column(name = "nombre_producto")
    private String nombreProducto;

    @Column(name = "descripcion_producto")
    private String descripcionProducto;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "stock_minimo")
    private Integer stockMinimo;

    @Column(name = "unidad_medida")
    private String unidadMedida;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_producto")
    private EstadoProducto estado;

    @OneToMany(mappedBy = "producto")
    private List<MovimientoInventarioEntity> movimientos;

}
