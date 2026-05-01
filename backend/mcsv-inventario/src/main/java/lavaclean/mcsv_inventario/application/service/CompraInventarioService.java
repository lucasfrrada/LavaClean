package lavaclean.mcsv_inventario.application.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lavaclean.mcsv_inventario.api.dto.request.compraInventario.CrearCompraInventarioRequest;
import lavaclean.mcsv_inventario.api.dto.request.detalleCompra.CrearDetalleCompraRequest;
import lavaclean.mcsv_inventario.api.dto.response.compraInventario.CompraInventarioResponse;
import lavaclean.mcsv_inventario.application.mapper.CompraInventarioMapper;
import lavaclean.mcsv_inventario.domain.model.EstadoCompra;
import lavaclean.mcsv_inventario.domain.model.TipoMovimientoInventario;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.*;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.CompraInventarioRepository;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.MovimientoInventarioRepository;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.ProductoRepository;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraInventarioService {

    private final CompraInventarioRepository compraInventarioRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    //REGISTRAR COMPRA
    @Transactional
    public CompraInventarioResponse registrarCompra(CrearCompraInventarioRequest request) {

        ProveedorEntity proveedor = proveedorRepository.findById(request.getIdProveedor())
                .orElseThrow(() -> new EntityNotFoundException("No existe el proveedor con ID: " + request.getIdProveedor()));


        CompraInventarioEntity compra = CompraInventarioEntity.builder()
                .proveedor(proveedor)
                .fechaCompra(request.getFechaCompra() != null ? request.getFechaCompra() : LocalDate.now())
                .estadoCompra(EstadoCompra.RECIBIDA)
                .observaciones(request.getObservaciones())
                .total(BigDecimal.ZERO)
                .build();

        List<DetalleCompraInventarioEntity> detalles = new ArrayList<>();
        List<MovimientoInventarioEntity> movimientos = new ArrayList<>();
        BigDecimal totalCompra = BigDecimal.ZERO;

        //CREACION DEL DETALLE DE LAS COMPRAS
        for (CrearDetalleCompraRequest detalleRequest : request.getDetalles()){

            ProductoEntity producto = productoRepository.findById(detalleRequest.getIdProducto())
                    .orElseThrow(() -> new EntityNotFoundException("No existe el producto: " + detalleRequest.getIdProducto()));


            BigDecimal cantidad = detalleRequest.getCantidad();
            BigDecimal precioUnitario = detalleRequest.getPrecioUnitario();
            BigDecimal subtotal = cantidad.multiply(precioUnitario);

            DetalleCompraInventarioEntity detalle = DetalleCompraInventarioEntity.builder()
                    .compraInventario(compra)
                    .producto(producto)
                    .cantidad(cantidad)
                    .precioUnitario(precioUnitario)
                    .subtotal(subtotal)
                    .build();

            detalles.add(detalle);
            totalCompra = totalCompra.add(subtotal);

            BigDecimal stockAnterior = producto.getStock();
            BigDecimal stockNuevo = stockAnterior.add(cantidad);

            producto.setStock(stockNuevo);

            MovimientoInventarioEntity movimiento = MovimientoInventarioEntity.builder()
                    .producto(producto)
                    .compraInventario(compra)
                    .tipoMovimiento(TipoMovimientoInventario.ENTRADA)
                    .cantidad(cantidad)
                    .stockAnterior(stockAnterior)
                    .stockNuevo(stockNuevo)
                    .fechaMovimiento(LocalDateTime.now())
                    .motivo("Entrada por compra de inventario")
                    .build();

            movimientos.add(movimiento);
        }


        compra.setTotal(totalCompra);
        compra.setDetalles(detalles);

        CompraInventarioEntity compraGuardada = compraInventarioRepository.save(compra);
        movimientoInventarioRepository.saveAll(movimientos);
        return CompraInventarioMapper.toResponse(compraGuardada);

    }


    //LISTAR TODAS LAS COMPRAS
    @Transactional
    public List<CompraInventarioResponse> listarCompras() {
        return compraInventarioRepository.findAll()
                .stream()
                .map(CompraInventarioMapper::toResponse)
                .toList();
    }


    //LISTAR COMPRA POR ID
    @Transactional
    public CompraInventarioResponse obtenerCompraPorId(Long id) {
        CompraInventarioEntity compra = compraInventarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el compra con id: " + id));

        return CompraInventarioMapper.toResponse(compra);
    }


}
