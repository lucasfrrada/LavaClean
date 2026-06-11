package mcsv.pedidos.application.mapper;

import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;

public class ServicioMapper {

    public static ServicioResponse toResponse(ServicioEntity entity) {
        return ServicioResponse.builder()
                .idServicio(entity.getIdServicio())
                .tipoServicio(entity.getTipoServicio())
                .precio(entity.getPrecio())
                .build();
    }
}