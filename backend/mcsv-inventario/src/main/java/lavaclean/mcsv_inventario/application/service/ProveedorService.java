package lavaclean.mcsv_inventario.application.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lavaclean.mcsv_inventario.api.dto.request.proveedor.ActualizarProveedorRequest;
import lavaclean.mcsv_inventario.api.dto.request.proveedor.CrearProveedorRequest;
import lavaclean.mcsv_inventario.api.dto.response.proveedor.ProveedorResponse;
import lavaclean.mcsv_inventario.application.mapper.ProveedorMapper;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProveedorEntity;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    // GUARDAR PROVEEDOR
    @Transactional
    public ProveedorResponse save(CrearProveedorRequest request){

        if (request.getCorreo() != null && proveedorRepository.existsByCorreo(request.getCorreo())){
            throw new IllegalArgumentException("Correo ya en uso!");
        }

        ProveedorEntity prov = ProveedorEntity.builder()
                .nombreProveedor(request.getNombreProveedor())
                .correo(request.getCorreo())
                .estado("ACTIVO")
                .direccion(request.getDireccion())
                .telefono(request.getTelefono())
                .build();

        ProveedorEntity saved = proveedorRepository.save(prov);

        return ProveedorMapper.toResponse(saved);

    }


    //LISTAR TODOS LOS PROVEEDORES
    @Transactional
    public List<ProveedorResponse> listAll(){

        return proveedorRepository.findAll()
                .stream()
                .map(ProveedorMapper::toResponse)
                .toList();
    }

    //PROVEEDOR POR ID
    @Transactional
    public ProveedorResponse findById(Long id){
        ProveedorEntity prov = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado!"));
        return ProveedorMapper.toResponse(prov);
    }

    //BORRAR PROVEEDOR POR ID
    @Transactional
    public void delete(Long id){

        ProveedorEntity prov = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado!"));

        proveedorRepository.delete(prov);

    }

    //ACTUALIZAR PROVEEDOR POR ID
    @Transactional
    public ProveedorResponse update(Long id, ActualizarProveedorRequest request){
        ProveedorEntity prov = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado!"));

        prov.setNombreProveedor(request.getNombreProveedor());
        prov.setCorreo(request.getCorreoProveedor());
        prov.setTelefono(request.getTelefonoProveedor());
        prov.setDireccion(request.getDireccionProveedor());

        if (request.getEstadoProveedor() != null){
            prov.setEstado(request.getEstadoProveedor());
        }

        ProveedorEntity updated = proveedorRepository.save(prov);
        return ProveedorMapper.toResponse(updated);
    }

}
