package mcsv.pedidos.infraestructure.persistence.repository;

import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import mcsv.pedidos.domain.model.TipoServicio;

import java.util.List;

public interface ServicioRepository extends JpaRepository<ServicioEntity, Long> {

    boolean existsByTipoServicio(String tipoServicio);
    List<ServicioEntity> findByTipoAndActivoTrue(TipoServicio tipo);
}
