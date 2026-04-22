package mcsv.pedidos.domain.repository;

import mcsv.pedidos.domain.model.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByIdPedido(Long idPedido);
    List<Pedido> findByIdUsuario(Long idUsuario);
}
