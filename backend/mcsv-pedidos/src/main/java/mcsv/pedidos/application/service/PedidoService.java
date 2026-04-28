package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.*;
import mcsv.pedidos.api.dto.response.PedidoResponse;
import mcsv.pedidos.application.mapper.PedidoMapper;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.infraestructure.persistence.entity.DetallePedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PrendaRepository prendaRepository;
    private final ServicioRepository servicioRepository;

    /* GUARDAR PEDIDO */
    @Transactional
    public PedidoResponse save(CrearPedidoRequest newPedidoRequest) {

        PedidoEntity pedido = new PedidoEntity();
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setFecha_entrega(newPedidoRequest.getFecha_entrega());
        pedido.setFecha_llegada(newPedidoRequest.getFecha_llegada());
        pedido.setIdUsuario(newPedidoRequest.getIdUsuario());

        List<DetallePedidoEntity> detalles = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CrearDetallePedidoRequest item : newPedidoRequest.getDetalles()){
            PrendaEntity prenda = prendaRepository.findById(item.getIdPrenda())
                    .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrado: "+ item.getIdPrenda()));


            ServicioEntity servicio = servicioRepository.findById(item.getIdServicio())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrada: " + item.getIdServicio()));


            BigDecimal precioUnitario = servicio.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setSubtotal(subtotal);
            detalle.setCantidad(item.getCantidad());
            detalle.setObservaciones(item.getObservaciones());
            detalle.setPrecioUnitario(precioUnitario);


            detalles.add(detalle);
            total = total.add(subtotal);
        }

        pedido.setDetallePedido(detalles);
        pedido.setTotal(total);

        PedidoEntity saved = pedidoRepository.save(pedido);


        return PedidoMapper.toResponse(saved);
    }


    /* LISTAR TODOS LOS PEDIDOS */
    @Transactional
    public List<PedidoResponse> listarPedidos() {
        return pedidoRepository.findAll()
                .stream()
                .map(PedidoMapper::toResponse)
                .toList();
    }

    /* ENCONTRAR POR ID DE PEDIDO */
    @Transactional
    public PedidoResponse findById(Long id) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));

        return PedidoMapper.toResponse(pedido);
    }

    /* ENCONTRAR POR USUARIO */
    @Transactional
    public List<PedidoResponse> findByIdUsuario(Long IdUsuario) {
        return pedidoRepository.findByIdUsuario(IdUsuario)
                .stream()
                .map(PedidoMapper::toResponse)
                .toList();
    }

    /* ACTUALIZAR PEDIDO */
    @Transactional
    public PedidoResponse actualizarPedido(Long id, ActualizarPedidoRequest request) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));

        validarPedidoEditable(pedido);

        pedido.setFecha_llegada(request.getFecha_llegada());
        pedido.setFecha_entrega(request.getFecha_entrega());
        pedido.getDetallePedido().clear();
        List<DetallePedidoEntity> nuevosDetalles = construirDetallesActualizar(request.getDetalles(), pedido);
        pedido.getDetallePedido().addAll(nuevosDetalles);
        pedido.setTotal(calcularTotal(nuevosDetalles));

        PedidoEntity actualizado = pedidoRepository.save(pedido);
        return PedidoMapper.toResponse(actualizado);
    }

    /* ACTUALIZAR ESTADO */
    @Transactional
    public PedidoResponse actualizarEstado(Long id, ActualizarEstadoPedidoRequest request) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));

        EstadoPedido nuevoEstado = EstadoPedido.valueOf(String.valueOf(request.getEstado()));

        validarCambioEstado(pedido.getEstado(), nuevoEstado);

        pedido.setEstado(nuevoEstado);

        PedidoEntity actualizado = pedidoRepository.save(pedido);
        return PedidoMapper.toResponse(actualizado);
    }


    /* ELIMINAR PEDIDO */
    @Transactional
    public void eliminarPedido(Long id) {
        PedidoEntity pedido = pedidoRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));

        if (pedido.getEstado() == EstadoPedido.ENTREGADO){
            throw new IllegalStateException("Este pedido no puede ser eliminado");
        }

        pedidoRepository.delete(pedido);
    }


    /* =================================== */
    /* AUXILIARES */
    /* =================================== */

    /* CONSTRUIR DETALLES */
    private List<DetallePedidoEntity> construirDetalles(
            List<CrearDetallePedidoRequest> items, PedidoEntity pedido
    ){
        List<DetallePedidoEntity> detalles = new ArrayList<>();

        for (CrearDetallePedidoRequest item : items) {
            PrendaEntity prenda = prendaRepository.findById(item.getIdPrenda())
                    .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrado: " + item.getIdPrenda()));

            ServicioEntity servicio = servicioRepository.findById(item.getIdServicio())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrada: " + item.getIdServicio()));

            BigDecimal precioUnitario = servicio.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setSubtotal(subtotal);
            detalle.setCantidad(item.getCantidad());
            detalles.add(detalle);
        }
        return detalles;
    }


    /* CONSTRUIR DETALLES ACTUALIZAR */
    private List<DetallePedidoEntity> construirDetallesActualizar(List<ActualizarDetallePedidoRequest> items, PedidoEntity pedido) {
        List<DetallePedidoEntity> detalles = new ArrayList<>();

        for (ActualizarDetallePedidoRequest item : items) {
            PrendaEntity prenda = prendaRepository.findById(item.getPrendaId())
                    .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrado: " + item.getPrendaId()));

            ServicioEntity servicio = servicioRepository.findById(item.getServicioId())
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrada: " + item.getServicioId()));

            BigDecimal precioUnitario = servicio.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setSubtotal(subtotal);
            detalle.setCantidad(item.getCantidad());
            detalles.add(detalle);

        }
        return detalles;
    }

    /* ACTUALIZAR TOTAL */
    private BigDecimal calcularTotal(List<DetallePedidoEntity> detalles) {
        return detalles.stream()
                .map(DetallePedidoEntity::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /* VALIDAR PEDIDO EDITABLE */
    private void validarPedidoEditable(PedidoEntity pedido){
        if (pedido.getEstado() == EstadoPedido.ENTREGADO || pedido.getEstado() == EstadoPedido.CANCELADO){
            throw new IllegalStateException("El pedido no puede editar");
        }
    }

    /* VALIDAR CAMBIO DE ESTADO */
    private void validarCambioEstado(EstadoPedido actual, EstadoPedido nuevo){
        if (actual == EstadoPedido.ENTREGADO || actual == EstadoPedido.CANCELADO){
            throw new IllegalStateException("El pedido no puede editar");
        }

        if (actual == nuevo){
            throw new IllegalStateException("El pedido ya tiene ese estado");
        }
    }





}
