package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.CrearDetallePedidoRequest;
import mcsv.pedidos.api.dto.CrearPedidoRequest;
import mcsv.pedidos.api.dto.PedidoResponse;
import mcsv.pedidos.application.mapper.PedidoMapper;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.infraestructure.persistence.entity.DetallePedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PrendaRepository prendaRepository;
    private final ServicioRepository servicioRepository;

    @Transactional
    public PedidoResponse save(CrearPedidoRequest newPedidoRequest) {

        PedidoEntity pedido = new PedidoEntity();
        pedido.setEstado(EstadoPedido.CREADO);
        pedido.setFecha_entrega(newPedidoRequest.getFecha_entrega());
        pedido.setFecha_llegada(newPedidoRequest.getFecha_llegada());
        pedido.setIdUsuario(newPedidoRequest.getIdUsuario());

        List<DetallePedidoEntity> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CrearDetallePedidoRequest item : newPedidoRequest.getDetalles()){
            PrendaEntity prenda = prendaRepository.findById(item.getIdPrenda())
                    .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrado: "+ item.getIdPrenda()));


            ServicioEntity servicio = servicioRepository.findById(item.getIdServicio())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrada: " + item.getIdServicio()));


            BigDecimal precioUnitario = servicio.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setSubtotal(subtotal);
            detalle.setCantidad(item.getCantidad());
            detalle.setObservaciones(item.getObservaciones());
            detalle.setPrecioUnitario(precioUnitario);


            detalles.add(detalle);
            total = total.add(subtotal);
        }

        pedido.setDetallePedido(detalles);
        pedido.setTotal(total);

        PedidoEntity saved = pedidoRepository.save(pedido);


        return PedidoMapper.toResponse(saved);
    }
}
