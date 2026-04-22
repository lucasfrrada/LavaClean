package mcsv.pedidos.infraestructure.persistence;

import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<ServicioEntity, Long> {
}
