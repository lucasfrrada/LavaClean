package mcsv.pedidos.application.mapper;

import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.api.dto.response.Servicio.ServicioOpcionResponse;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;

public class ServicioMapper {

    public static ServicioResponse toResponse(ServicioEntity entity) {
        return ServicioResponse.builder()
                .idServicio(entity.getIdServicio())
                .tipoServicio(entity.getTipoServicio())
                .precio(entity.getPrecio())
                .precioBase(entity.getPrecio())
                .descripcion(entity.getDescripcion())
                .tipo(entity.getTipo())
                .modalidadCobro(entity.getModalidadCobro())
                .activo(entity.getActivo())
                .opciones(entity.getOpciones().stream()
                        .map(opcion -> ServicioOpcionResponse.builder()
                                .idServicioOpcion(opcion.getIdServicioOpcion())
                                .codigo(opcion.getCodigo())
                                .nombre(opcion.getNombre())
                                .precio(opcion.getPrecio())
                                .activo(opcion.getActivo())
                                .build())
                        .toList())
                .build();
    }
}
