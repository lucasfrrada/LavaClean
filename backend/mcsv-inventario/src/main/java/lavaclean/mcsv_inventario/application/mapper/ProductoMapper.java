package lavaclean.mcsv_inventario.application.mapper;

import lavaclean.mcsv_inventario.api.dto.response.producto.ProductoResponse;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProductoEntity;

public class ProductoMapper {

    public static ProductoResponse toResponse(ProductoEntity entity) {
        return ProductoResponse.builder()
                .idProducto(entity.getIdProducto())
                .nombreProducto(entity.getNombreProducto())
                .descripcion(entity.getDescripcionProducto())
                .stock(entity.getStock())
                .stockMinimo(entity.getStockMinimo())
                .unidadMedida(entity.getUnidadMedida())
                .estado(entity.getEstado())
                .build();
    }

}
