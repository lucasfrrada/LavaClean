package mcsv.pedidos.application.mapper;

import mcsv.pedidos.api.dto.response.DetallePedidoResponse;
import mcsv.pedidos.api.dto.response.PedidoResponse;
import mcsv.pedidos.infraestructure.persistence.entity.DetallePedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;

import java.util.List;

public class PedidoMapper {

    public static PedidoResponse toResponse(PedidoEntity pedidoEntity) {
        List<DetallePedidoResponse> detalles = pedidoEntity.getDetallePedido()
                .stream()
                .map(PedidoMapper::toDetalleResponse)
                .toList();


        return PedidoResponse.builder()
                .idPedido(pedidoEntity.getIdPedido())
                .idUsuario(pedidoEntity.getIdUsuario())
                .estado(pedidoEntity.getEstado().name())
                .fechaEntrega(pedidoEntity.getFecha_entrega())
                .fechaLlegada(pedidoEntity.getFecha_llegada())
                .total(pedidoEntity.getTotal())
                .detalles(detalles)
                .build();
    }


    public static DetallePedidoResponse toDetalleResponse(DetallePedidoEntity entity) {
        return DetallePedidoResponse.builder()
                .idPedido(entity.getIdDetallePedido())
                .prenda(entity.getPrenda().getNombre_prenda())
                .categoriaPrenda(entity.getPrenda().getCategoria())
                .servicio(entity.getServicio().getTipoServicio())
                .cantidad(entity.getCantidad())
                .observaciones(entity.getObservaciones())
                .precioUnitario(entity.getPrecioUnitario())
                .subtotal(entity.getSubtotal())
                .build();
    }


}
