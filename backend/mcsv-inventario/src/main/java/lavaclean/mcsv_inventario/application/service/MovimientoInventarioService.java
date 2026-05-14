package lavaclean.mcsv_inventario.application.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lavaclean.mcsv_inventario.api.dto.request.movimientoInventario.CrearMovimientoInventarioRequest;
import lavaclean.mcsv_inventario.api.dto.response.movimientoInventario.MovimientoInventarioResponse;
import lavaclean.mcsv_inventario.application.mapper.MovimientoInventarioMapper;
import lavaclean.mcsv_inventario.domain.model.TipoMovimientoInventario;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.MovimientoInventarioEntity;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProductoEntity;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.MovimientoInventarioRepository;
import lavaclean.mcsv_inventario.infraestructure.persistance.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoRepository productoRepository;

    //GUARDAR MOVIMIENTO
    @Transactional
    public MovimientoInventarioResponse registrarMovimiento(CrearMovimientoInventarioRequest request){
        ProductoEntity producto = productoRepository.findById(request.getIdProducto())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));



        if (!"ACTIVO".equalsIgnoreCase(producto.getEstado())) {
            throw new IllegalStateException("No se pueden registrar movimiento para un producto inactivo");
        }

        BigDecimal stockAnterior = producto.getStock();
        BigDecimal stockNuevo = calcularStockNuevo(
                stockAnterior,
                request.getCantidad(),
                request.getTipoMovimiento()
        );
        

        if (stockNuevo.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Stock quedaría en negativo, no se puede hacer");
        }

        producto.setStock(stockNuevo);

        MovimientoInventarioEntity movimiento = MovimientoInventarioEntity.builder()
                .producto(producto)
                .compraInventario(null)
                .tipoMovimiento(request.getTipoMovimiento())
                .cantidad(request.getCantidad())
                .stockAnterior(stockAnterior)
                .stockNuevo(stockNuevo)
                .fechaMovimiento(LocalDateTime.now())
                .motivo(request.getMotivo())
                .build();

        MovimientoInventarioEntity saved = movimientoInventarioRepository.save(movimiento);

        return MovimientoInventarioMapper.toResponse(saved);

    }

    //LISTAR TODOS LOS MOVIMIENTOS
    @Transactional
    public List<MovimientoInventarioResponse> listAll(){
        return movimientoInventarioRepository.findAll()
                .stream()
                .map(MovimientoInventarioMapper::toResponse)
                .toList();
    }

    //LISTAR MOVIMIENTO POR ID
    @Transactional
    public MovimientoInventarioResponse findById(Long id){
        MovimientoInventarioEntity movimiento = movimientoInventarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimiento no encontrado"));

        return MovimientoInventarioMapper.toResponse(movimiento);
    }

    //LISTAR MOVIMIENTO POR PRODUCTO
    @Transactional
    public List<MovimientoInventarioResponse> listarMovimientosPorProducto(Long idProducto) {
        return movimientoInventarioRepository.findByProductoIdProducto(idProducto)
                .stream()
                .map(MovimientoInventarioMapper::toResponse)
                .toList();
    }


    //LISTAR MOVIMIENTO POR TIPO
    @Transactional
    public List<MovimientoInventarioResponse> listarMovimientosPorTipo(TipoMovimientoInventario tipoMovimiento) {
        return movimientoInventarioRepository.findByTipoMovimiento(tipoMovimiento)
                .stream()
                .map(MovimientoInventarioMapper::toResponse)
                .toList();
    }


    //AUXILIAR PARA CALCULAR STOCK
    private BigDecimal calcularStockNuevo(
            BigDecimal stockAnterior,
            BigDecimal cantidad,
            TipoMovimientoInventario tipoMovimiento
    ) {
        return switch (tipoMovimiento) {
            case ENTRADA -> stockAnterior.add(cantidad);
            case SALIDA -> stockAnterior.subtract(cantidad);
            case AJUSTE -> cantidad;
        };
    }



}
