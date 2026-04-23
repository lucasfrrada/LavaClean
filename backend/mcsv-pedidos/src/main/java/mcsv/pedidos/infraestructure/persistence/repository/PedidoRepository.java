package mcsv.pedidos.infraestructure.persistence.repository;

import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Long> {
    List<PedidoEntity> findByUsuarioId(Long idUsuario);
}
