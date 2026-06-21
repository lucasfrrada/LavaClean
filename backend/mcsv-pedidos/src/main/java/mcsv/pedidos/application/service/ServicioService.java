package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Servicio.ActualizarServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.CrearServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.ServicioOpcionRequest;
import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.application.mapper.ServicioMapper;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioOpcionEntity;
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
        TipoServicio tipo = request.getTipo() == null ? TipoServicio.BASE : request.getTipo();
        ModalidadCobro modalidad = request.getModalidadCobro() == null
                ? ModalidadCobro.POR_CARGA : request.getModalidadCobro();
        validarOpciones(modalidad, request.getOpciones());
        ServicioEntity servicio = ServicioEntity.builder()
                .tipoServicio(request.getTipoServicio())
                .descripcion(request.getDescripcion())
                .tipo(tipo)
                .modalidadCobro(modalidad)
                .precio(request.getPrecio())
                .activo(request.getActivo() == null || request.getActivo())
                .build();
        servicio.reemplazarOpciones(mapearOpciones(request.getOpciones(), servicio));
        return ServicioMapper.toResponse(servicioRepository.save(servicio));
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarServicios() {
        return servicioRepository.findAll().stream().map(ServicioMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarDisponibles(TipoServicio tipo) {
        return servicioRepository.findByTipoAndActivoTrue(tipo).stream()
                .map(ServicioMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ServicioResponse obtenerServicioPorId(Long id) {
        return ServicioMapper.toResponse(buscar(id));
    }

    @Transactional
    public ServicioResponse actualizarServicio(Long id, ActualizarServicioRequest request) {
        ServicioEntity servicio = buscar(id);
        TipoServicio tipo = request.getTipo() == null ? servicio.getTipo() : request.getTipo();
        ModalidadCobro modalidad = request.getModalidadCobro() == null
                ? servicio.getModalidadCobro() : request.getModalidadCobro();
        validarOpciones(modalidad, request.getOpciones());
        servicio.setTipoServicio(request.getTipoServicio());
        servicio.setDescripcion(request.getDescripcion());
        servicio.setTipo(tipo);
        servicio.setModalidadCobro(modalidad);
        servicio.setPrecio(request.getPrecio());
        servicio.setActivo(request.getActivo() == null || request.getActivo());
        servicio.reemplazarOpciones(mapearOpciones(request.getOpciones(), servicio));
        return ServicioMapper.toResponse(servicioRepository.save(servicio));
    }

    @Transactional
    public ServicioResponse cambiarActivo(Long id, boolean activo) {
        ServicioEntity servicio = buscar(id);
        servicio.setActivo(activo);
        return ServicioMapper.toResponse(servicioRepository.save(servicio));
    }

    @Transactional
    public void eliminarServicio(Long id) {
        servicioRepository.delete(buscar(id));
    }

    private ServicioEntity buscar(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + id));
    }

    private void validarOpciones(ModalidadCobro modalidad, List<ServicioOpcionRequest> opciones) {
        if (modalidad == ModalidadCobro.POR_OPCION && (opciones == null || opciones.isEmpty())) {
            throw new IllegalArgumentException("Un servicio POR_OPCION debe tener al menos una opción");
        }
    }

    private List<ServicioOpcionEntity> mapearOpciones(
            List<ServicioOpcionRequest> opciones, ServicioEntity servicio) {
        if (opciones == null) return List.of();
        return opciones.stream().map(opcion -> ServicioOpcionEntity.builder()
                .servicio(servicio)
                .codigo(opcion.getCodigo().trim().toUpperCase())
                .nombre(opcion.getNombre().trim())
                .precio(opcion.getPrecio())
                .activo(opcion.getActivo() == null || opcion.getActivo())
                .build()).toList();
    }
}
