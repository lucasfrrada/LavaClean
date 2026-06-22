package mcsv.pedidos.application.mapper;

import mcsv.pedidos.api.dto.response.Pedido.DetallePedidoResponse;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.api.dto.response.Pedido.PedidoServicioResponse;
import mcsv.pedidos.domain.model.TipoServicio;
import mcsv.pedidos.infraestructure.persistence.entity.DetallePedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;

import java.util.List;

public class PedidoMapper {

    public static PedidoResponse toResponse(PedidoEntity pedidoEntity) {
        List<DetallePedidoResponse> detalles = pedidoEntity.getDetallePedido()
                .stream()
                .map(PedidoMapper::toDetalleResponse)
                .toList();

        List<PedidoServicioResponse> servicios = pedidoEntity.getServicios().stream()
                .map(PedidoMapper::toServicioResponse)
                .toList();


        return PedidoResponse.builder()
                .idPedido(pedidoEntity.getIdPedido())
                .idUsuario(pedidoEntity.getIdUsuario())
                .estado(pedidoEntity.getEstado().name())
                .fechaEntrega(pedidoEntity.getFecha_entrega())
                .fechaLlegada(pedidoEntity.getFecha_llegada())
                .total(pedidoEntity.getTotal())
                .pesoEstimadoKg(pedidoEntity.getPesoEstimadoKg())
                .pesoRealKg(pedidoEntity.getPesoRealKg())
                .precioEstimado(pedidoEntity.getPrecioEstimado())
                .precioFinal(pedidoEntity.getPrecioFinal())
                .precioPorCarga(pedidoEntity.getPrecioPorCarga())
                .cargasEstimadas(pedidoEntity.getCargasEstimadas())
                .cargasReales(pedidoEntity.getCargasReales())
                .detalles(detalles)
                .servicioBase(servicios.stream()
                        .filter(servicio -> servicio.getTipo() == TipoServicio.BASE)
                        .findFirst().orElse(null))
                .serviciosExtras(servicios.stream()
                        .filter(servicio -> servicio.getTipo() == TipoServicio.EXTRA)
                        .toList())
                .observacionesCliente(pedidoEntity.getObservacionesCliente())
                .observacionesInternas(pedidoEntity.getObservacionesInternas())
                .fechaCreacion(pedidoEntity.getFechaCreacion())
                .fechaActualizacion(pedidoEntity.getFechaActualizacion())
                .build();
    }

    private static PedidoServicioResponse toServicioResponse(
            mcsv.pedidos.infraestructure.persistence.entity.PedidoServicioEntity entity) {
        return PedidoServicioResponse.builder()
                .idPedidoServicio(entity.getIdPedidoServicio())
                .idServicio(entity.getServicio().getIdServicio())
                .nombre(entity.getServicio().getTipoServicio())
                .tipo(entity.getTipo())
                .modalidadCobro(entity.getServicio().getModalidadCobro())
                .opcionCodigo(entity.getOpcionCodigo())
                .opcionNombre(entity.getOpcionNombre())
                .cantidad(entity.getCantidad())
                .observaciones(entity.getObservaciones())
                .precioUnitario(entity.getPrecioUnitario())
                .precioEstimado(entity.getPrecioEstimado())
                .precioFinal(entity.getPrecioFinal())
                .build();
    }


    public static DetallePedidoResponse toDetalleResponse(DetallePedidoEntity entity) {
        return DetallePedidoResponse.builder()
                .idPedido(entity.getIdDetallePedido())
                .prenda(entity.getPrenda().getNombrePrenda())
                .categoriaPrenda(entity.getPrenda().getCategoria())
                .servicio(entity.getServicio().getTipoServicio())
                .cantidad(entity.getCantidad())
                .observaciones(entity.getObservaciones())
                .pesoReferenciaKg(entity.getPesoReferenciaKg())
                .pesoEstimadoKg(entity.getPesoEstimadoKg())
                .precioPorCarga(entity.getPrecioPorCarga())
                .build();
    }


}
