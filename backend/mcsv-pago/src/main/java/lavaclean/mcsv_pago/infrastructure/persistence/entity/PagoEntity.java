package lavaclean.mcsv_pago.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @Column(name = "id_pedido", nullable = false)
    private String idPedido;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(nullable = false)
    private Integer monto;

    @Column(name = "estado_pago", nullable = false)
    private String estadoPago; // PENDIENTE, APROBADO, RECHAZADO

    @Column(name = "url_pago", length = 500)
    private String urlPago;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estadoPago == null) {
            this.estadoPago = "PENDIENTE";
        }
    }
}
