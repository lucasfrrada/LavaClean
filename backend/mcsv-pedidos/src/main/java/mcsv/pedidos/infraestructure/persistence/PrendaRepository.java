package mcsv.pedidos.infraestructure.persistence;

import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrendaRepository extends JpaRepository<PedidoEntity, Long> {
}
