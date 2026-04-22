package mcsv.pedidos.infraestructure.persistence;

import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<PedidoEntity, Integer> {
    List<PedidoEntity> findByUsuarioId(Long idUsuario);
}
