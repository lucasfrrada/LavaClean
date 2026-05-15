package lavaclean.mcsv_inventario.application.mapper;

import lavaclean.mcsv_inventario.api.dto.response.movimientoInventario.MovimientoInventarioResponse;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.MovimientoInventarioEntity;

public class MovimientoInventarioMapper {

    public static MovimientoInventarioResponse toResponse(MovimientoInventarioEntity entity){
        return MovimientoInventarioResponse.builder()
                .idMovimiento(entity.getIdMovimiento())
                .tipoMovimiento(entity.getTipoMovimiento())
                .idProducto(entity.getProducto().getIdProducto())
                .nombreProducto(entity.getProducto().getNombreProducto())
                .idCompraInventario(entity.getCompraInventario() != null ? entity.getCompraInventario().getIdCompraInventario() : null)
                .cantidad(entity.getCantidad())
                .stockAnterior(entity.getStockAnterior())
                .stockNuevo(entity.getStockNuevo())
                .fechaMovimiento(entity.getFechaMovimiento())
                .motivo(entity.getMotivo())
                .build();
    }
}
