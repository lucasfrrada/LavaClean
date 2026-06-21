package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servicios")
@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@ToString
@Builder
public class ServicioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "tipo_servicio")
    private String tipoServicio;

    @Column(name = "precio")
    private BigDecimal precio;

    @Column(name = "descripcion", length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    @Builder.Default
    private TipoServicio tipo = TipoServicio.BASE;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_cobro", nullable = false)
    @Builder.Default
    private ModalidadCobro modalidadCobro = ModalidadCobro.FIJO;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServicioOpcionEntity> opciones = new ArrayList<>();

    public void reemplazarOpciones(List<ServicioOpcionEntity> nuevasOpciones) {
        opciones.clear();
        nuevasOpciones.forEach(opcion -> opcion.setServicio(this));
        opciones.addAll(nuevasOpciones);
    }
}
