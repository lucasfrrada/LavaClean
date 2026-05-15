package mcsv.mcsv_notificacion.infrastructure.persistence.repository;

import mcsv.mcsv_notificacion.infrastructure.persistence.entity.NotificacionEntity;
import mcsv.mcsv_notificacion.domain.EstadoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {
 
    // 1. Para Sistemas de Reintento (Jobs/Schedulers)
    List<NotificacionEntity> findByEstadoEnvio(EstadoNotificacion estadoEnvio);

    // 2. Para el Historial del Cliente (Bandeja de entrada)
    List<NotificacionEntity> findByIdUsuarioOrderByFechaCreacionDesc(Long idUsuario);

    // 3. Para la Trazabilidad del Pedido
    List<NotificacionEntity> findByIdPedido(Long idPedido);

    // 4. Para Tareas de Mantenimiento / Limpieza
    List<NotificacionEntity> findByFechaCreacionBefore(LocalDateTime fecha);
}