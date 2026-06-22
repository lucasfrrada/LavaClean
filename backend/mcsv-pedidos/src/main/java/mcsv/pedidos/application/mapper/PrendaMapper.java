package mcsv.pedidos.application.mapper;

import mcsv.pedidos.api.dto.response.Prenda.PrendaResponse;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;

public class PrendaMapper {

    public static PrendaResponse toResponse(PrendaEntity entity) {
        return PrendaResponse.builder()
                .idPrenda(entity.getIdPrenda())
                .nombrePrenda(entity.getNombrePrenda())
                .categoria(entity.getCategoria())
                .pesoReferenciaKg(entity.getPesoReferenciaKg())
                .build();
    }
}
