package mcsv.mcsv_notificacion.infrastructure.persistence.repository;

import mcsv.mcsv_notificacion.infrastructure.persistence.entity.NotificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {
}
