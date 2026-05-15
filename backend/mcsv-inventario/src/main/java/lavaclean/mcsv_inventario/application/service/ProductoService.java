package lavaclean.mcsv_inventario.application.service;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lavaclean.mcsv_inventario.api.dto.request.producto.ActualizarProductoRequest;
import lavaclean.mcsv_inventario.api.dto.request.producto.CrearProductoRequest;
import lavaclean.mcsv_inventario.api.dto.response.producto.ProductoResponse;
import lavaclean.mcsv_inventario.application.mapper.ProductoMapper;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProductoEntity;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.ProductoRepository;
import lavaclean.mcsv_inventario.application.mapper.ProductoMapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {


    private final ProductoRepository productoRepository;

    //GUARDAR PRODUCTO
    @Transactional
    public ProductoResponse save(CrearProductoRequest request) {
        if (productoRepository.existsByNombreProducto(request.getNombreProducto())) {
            throw new IllegalArgumentException("El nombre producto ya existe");
        }

        ProductoEntity entity = ProductoEntity.builder()
                .nombreProducto(request.getNombreProducto())
                .descripcionProducto(request.getDescripcion())
                .stock(request.getStock())
                .stockMinimo(request.getStockMinimo())
                .estado("ACTIVO")
                .unidadMedida(request.getUnidadMedida())
                .build();

        ProductoEntity saved = productoRepository.save(entity);

        return ProductoMapper.toResponse(saved);
    }

    //LISTAR TODOS LOS ACTIVOS
    @Transactional
    public List<ProductoResponse> findAll() {
        return productoRepository.findByEstado("ACTIVO")
                .stream()
                .map(ProductoMapper::toResponse)
                .toList();
    }

    //OBTENER POR ID
    @Transactional
    public ProductoResponse findById(Long id) {
        ProductoEntity entity = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto con ID: "+id+" no encontrado"));

        return ProductoMapper.toResponse(entity);
    }

    //BORRAR POR ID
    @Transactional
    public void delete(Long id) {
        ProductoEntity entity = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto con ID: "+id+" no encontrado"));
        productoRepository.delete(entity);
    }

    //ACTUALIZAR POR ID
    @Transactional
    public ProductoResponse updateProduct(Long id, ActualizarProductoRequest request){

        ProductoEntity entity = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto con ID: "+id+" no encontrado"));

        entity.setNombreProducto(request.getNombreProducto());
        entity.setDescripcionProducto(request.getDescripcion());
        entity.setStock(request.getStock());
        entity.setStockMinimo(request.getStockMinimo());
        entity.setUnidadMedida(request.getUnidadMedida());

        if (request.getEstado() != null) {
            entity.setEstado(request.getEstado());
        }

        ProductoEntity updated = productoRepository.save(entity);

        return ProductoMapper.toResponse(updated);

    }

}
