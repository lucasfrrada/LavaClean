package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Servicio.ActualizarServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.CrearServicioRequest;
import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.application.mapper.ServicioMapper;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;

    @Transactional
    public ServicioResponse crearServicio(CrearServicioRequest request) {

        if (servicioRepository.existsByTipoServicio(request.getTipoServicio())) {
            throw new IllegalArgumentException("Ya existe un servicio con ese nombre");
        }

        ServicioEntity servicio = ServicioEntity.builder()
                .tipoServicio(request.getTipoServicio())
                .precio(request.getPrecio())
                .build();

        ServicioEntity guardado = servicioRepository.save(servicio);

        return ServicioMapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarServicios() {
        return servicioRepository.findAll()
                .stream()
                .map(ServicioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicioResponse obtenerServicioPorId(Long id) {
        ServicioEntity servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + id));

        return ServicioMapper.toResponse(servicio);
    }

    @Transactional
    public ServicioResponse actualizarServicio(Long id, ActualizarServicioRequest request) {
        ServicioEntity servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + id));

        servicio.setTipoServicio(request.getTipoServicio());
        servicio.setPrecio(request.getPrecio());

        ServicioEntity actualizado = servicioRepository.save(servicio);

        return ServicioMapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminarServicio(Long id) {
        ServicioEntity servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + id));

        servicioRepository.delete(servicio);
    }
}