package mcsv.mcsv_notificacion.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import mcsv.mcsv_notificacion.domain.EstadoNotificacion;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion")
    private Long idNotificacion;

    @Column(name = "tipo_notificacion")
    private String tipoNotificacion;

    @Column(name = "mensaje")
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_envio", nullable = false)
    private EstadoNotificacion estadoEnvio;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estadoEnvio == null) {
            this.estadoEnvio = EstadoNotificacion.PENDIENTE;
        }
    }
}
