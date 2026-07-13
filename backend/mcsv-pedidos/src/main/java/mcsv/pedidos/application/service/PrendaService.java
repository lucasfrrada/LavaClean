package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Prenda.ActualizarPrendaRequest;
import mcsv.pedidos.api.dto.request.Prenda.CrearPrendaRequest;
import mcsv.pedidos.api.dto.response.Prenda.PrendaResponse;
import mcsv.pedidos.application.mapper.PrendaMapper;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrendaService {

    private final PrendaRepository prendaRepository;

    @Transactional
    public PrendaResponse crearPrenda(CrearPrendaRequest request) {

        if (prendaRepository.existsByNombrePrenda(request.getNombrePrenda())) {
            throw new IllegalArgumentException("Ya existe una prenda con ese nombre");
        }

        PrendaEntity prenda = PrendaEntity.builder()
                .nombrePrenda(request.getNombrePrenda())
                .categoria(request.getCategoria())
                .pesoReferenciaKg(request.getPesoReferenciaKg())
                .build();

        PrendaEntity guardada = prendaRepository.save(prenda);

        return PrendaMapper.toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public List<PrendaResponse> listarPrendas() {
        return prendaRepository.findAll()
                .stream()
                .map(PrendaMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PrendaResponse obtenerPrendaPorId(Long id) {
        PrendaEntity prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrada con id: " + id));

        return PrendaMapper.toResponse(prenda);
    }

    @Transactional
    public PrendaResponse actualizarPrenda(Long id, ActualizarPrendaRequest request) {
        PrendaEntity prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrada con id: " + id));

        prenda.setNombrePrenda(request.getNombrePrenda());
        prenda.setCategoria(request.getCategoria());
        prenda.setPesoReferenciaKg(request.getPesoReferenciaKg());

        PrendaEntity actualizada = prendaRepository.save(prenda);

        return PrendaMapper.toResponse(actualizada);
    }

    @Transactional
    public void eliminarPrenda(Long id) {
        PrendaEntity prenda = prendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrada con id: " + id));

        prendaRepository.delete(prenda);
    }
}
