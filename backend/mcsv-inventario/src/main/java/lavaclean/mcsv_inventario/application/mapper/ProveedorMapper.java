package lavaclean.mcsv_inventario.application.mapper;

import lavaclean.mcsv_inventario.api.dto.response.proveedor.ProveedorResponse;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProveedorEntity;

public class ProveedorMapper {

    public static ProveedorResponse toResponse(ProveedorEntity entity){
        return ProveedorResponse.builder()
                .idProveedor(entity.getIdProveedor())
                .nombreProveedor(entity.getNombreProveedor())
                .telefono(entity.getTelefono())
                .correo(entity.getCorreo())
                .estado(entity.getEstado())
                .direccion(entity.getDireccion())
                .build();
    }

}
