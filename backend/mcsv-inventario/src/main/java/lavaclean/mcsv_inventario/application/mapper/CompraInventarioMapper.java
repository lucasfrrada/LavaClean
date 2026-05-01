package lavaclean.mcsv_inventario.application.mapper;

import lavaclean.mcsv_inventario.api.dto.response.compraInventario.CompraInventarioResponse;
import lavaclean.mcsv_inventario.api.dto.response.detalleCompra.DetalleCompraResponse;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.CompraInventarioEntity;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.DetalleCompraInventarioEntity;

import java.util.ArrayList;
import java.util.List;

public class CompraInventarioMapper {

    public static CompraInventarioResponse toResponse(CompraInventarioEntity entity){
        List<DetalleCompraResponse> detalles = entity.getDetalles()
                .stream()
                .map(CompraInventarioMapper::toDetalleResponse)
                .toList();


        return CompraInventarioResponse.builder()
                .idCompraInventario(entity.getIdCompraInventario())
                .idProveedor(entity.getProveedor().getIdProveedor())
                .nombreProveedor(entity.getProveedor().getNombreProveedor())
                .fechaCompra(entity.getFechaCompra())
                .total(entity.getTotal())
                .estadoCompra(entity.getEstadoCompra())
                .observaciones(entity.getObservaciones())
                .detalles(detalles)
                .build();
    }


    private static DetalleCompraResponse toDetalleResponse(DetalleCompraInventarioEntity entity){
        return DetalleCompraResponse.builder()
                .idDetalleCompra(entity.getIdDetalleCompra())
                .idProducto(entity.getProducto().getIdProducto())
                .nombreProducto(entity.getProducto().getNombreProducto())
                .cantidad(entity.getCantidad())
                .precioUnitario(entity.getPrecioUnitario())
                .subtotal(entity.getSubtotal())
                .build();
    }


}
