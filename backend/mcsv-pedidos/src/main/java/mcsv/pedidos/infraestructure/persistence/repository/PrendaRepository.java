package mcsv.pedidos.infraestructure.persistence.repository;

import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrendaRepository extends JpaRepository<PrendaEntity, Long> {
}
