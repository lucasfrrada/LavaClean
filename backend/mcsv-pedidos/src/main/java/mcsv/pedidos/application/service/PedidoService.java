package mcsv.pedidos.application.service;

import mcsv.pedidos.domain.model.entities.Pedido;

import java.util.List;

public interface PedidoService {

    Pedido findById(Long id);
    List<Pedido> findByIdUsuario(Long idUsuario);
    List<Pedido> findAll();
    void deleteById(Long id);
    Pedido save(Pedido pedido);
    Pedido update(Long id, Pedido pedido);

}
