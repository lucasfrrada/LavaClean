package mcsv.pedidos.application.service;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Pedido.*;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.api.dto.response.UsuarioResponseRest;
import mcsv.pedidos.application.mapper.PedidoMapper;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.infraestructure.client.UsuarioClientRest;
import mcsv.pedidos.infraestructure.messaging.PedidoEstadoCambiadoEvent;
import mcsv.pedidos.infraestructure.messaging.PedidoEventProducer;
import mcsv.pedidos.infraestructure.persistence.entity.DetallePedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PrendaRepository prendaRepository;
    private final ServicioRepository servicioRepository;
    private final UsuarioClientRest usuarioClientRest;
    private final PedidoEventProducer pedidoEventProducer;

    private static final int ESCALA_PESO = 3;
    private static final int ESCALA_DINERO = 2;
    private static final BigDecimal KG_POR_CARGA = new BigDecimal("5");

    /* GUARDAR PEDIDO */
    @Transactional
    public PedidoResponse save(CrearPedidoRequest newPedidoRequest) {

        PedidoEntity pedido = new PedidoEntity();
        pedido.setEstado(EstadoPedido.REVISION);
        pedido.setFecha_entrega(newPedidoRequest.getFecha_entrega());
        pedido.setFecha_llegada(newPedidoRequest.getFecha_llegada());

        try{
            UsuarioResponseRest usuario = usuarioClientRest.getUsuario(newPedidoRequest.getIdUsuario());
        } catch (FeignException.NotFound ex){
            throw new EntityNotFoundException("Usuario con ID: "+newPedidoRequest.getIdUsuario()+" no encontrado");
        }


        pedido.setIdUsuario(newPedidoRequest.getIdUsuario());

        List<DetallePedidoEntity> detalles = construirDetalles(newPedidoRequest.getDetalles(), pedido);
        BigDecimal pesoEstimado = calcularPesoEstimado(detalles);
        int cargasEstimadas = calcularCargas(pesoEstimado);
        BigDecimal precioPorCarga = obtenerPrecioPorCarga(detalles);
        BigDecimal precioEstimado = calcularPrecio(precioPorCarga, cargasEstimadas);

        pedido.setDetallePedido(detalles);
        pedido.setPesoEstimadoKg(pesoEstimado);
        pedido.setPrecioEstimado(precioEstimado);
        pedido.setCargasEstimadas(cargasEstimadas);
        pedido.setPrecioPorCarga(precioPorCarga);
        pedido.setTotal(precioEstimado);

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
        BigDecimal pesoEstimado = calcularPesoEstimado(nuevosDetalles);
        int cargasEstimadas = calcularCargas(pesoEstimado);
        BigDecimal precioPorCarga = obtenerPrecioPorCarga(nuevosDetalles);
        BigDecimal precioEstimado = calcularPrecio(precioPorCarga, cargasEstimadas);
        pedido.setPesoEstimadoKg(pesoEstimado);
        pedido.setPrecioEstimado(precioEstimado);
        pedido.setCargasEstimadas(cargasEstimadas);
        pedido.setPrecioPorCarga(precioPorCarga);
        pedido.setTotal(precioEstimado);

        PedidoEntity actualizado = pedidoRepository.save(pedido);
        return PedidoMapper.toResponse(actualizado);
    }

    /* ACTUALIZAR ESTADO */
    @Transactional
    public PedidoResponse actualizarEstado(
            Long id,
            ActualizarEstadoPedidoRequest request
    ) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Pedido no encontrado con id: " + id
                        )
                );

        EstadoPedido nuevoEstado =
                EstadoPedido.valueOf(String.valueOf(request.getEstado()));

        validarCambioEstado(pedido.getEstado(), nuevoEstado);

        pedido.setEstado(nuevoEstado);

        PedidoEntity actualizado = pedidoRepository.save(pedido);

        PedidoEstadoCambiadoEvent evento = new PedidoEstadoCambiadoEvent(
                UUID.randomUUID(),
                actualizado.getIdPedido(),
                actualizado.getIdUsuario(),
                actualizado.getEstado().name(),
                "CAMBIO_ESTADO",
                "Tu pedido #" + actualizado.getIdPedido()
                        + " cambió al estado " + actualizado.getEstado().name(),
                LocalDateTime.now()
        );

        pedidoEventProducer.publicarCambioEstado(evento);

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

    /* CONFIRMAR PEDIDO */
    @Transactional
    public PedidoResponse confirmarPesoReal(Long id, ConfirmarPesoRealRequest request) {
        PedidoEntity pedido = pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Pedido no encontrado con id: " + id
                        )
                );

        if (pedido.getEstado() != EstadoPedido.REVISION) {
            throw new IllegalStateException(
                    "Solo se puede confirmar el peso de pedidos en estado REVISION"
            );
        }

        if (pedido.getPesoEstimadoKg() == null || pedido.getPesoEstimadoKg().signum() <= 0) {
            throw new IllegalStateException("El pedido no tiene un peso estimado válido");
        }

        int cargasReales = calcularCargas(request.getPesoRealKg());
        if (pedido.getPrecioPorCarga() == null || pedido.getPrecioPorCarga().signum() <= 0) {
            throw new IllegalStateException("El pedido no tiene un precio por carga válido");
        }
        BigDecimal precioFinal = calcularPrecio(pedido.getPrecioPorCarga(), cargasReales);

        pedido.setPesoRealKg(request.getPesoRealKg().setScale(ESCALA_PESO, RoundingMode.HALF_UP));
        pedido.setPrecioFinal(precioFinal);
        pedido.setCargasReales(cargasReales);
        pedido.setTotal(precioFinal);
        pedido.setEstado(EstadoPedido.CONFIRMADO);

        PedidoEntity actualizado = pedidoRepository.save(pedido);

        PedidoEstadoCambiadoEvent evento = new PedidoEstadoCambiadoEvent(
                UUID.randomUUID(),
                actualizado.getIdPedido(),
                actualizado.getIdUsuario(),
                actualizado.getEstado().name(),
                "PESO_REAL_CONFIRMADO",
                "Confirmamos el peso real de tu pedido #" + actualizado.getIdPedido()
                        + ": " + actualizado.getPesoRealKg() + " kg. Valor final: $"
                        + actualizado.getPrecioFinal().setScale(0, RoundingMode.HALF_UP)
                        + " CLP (" + actualizado.getCargasReales() + " carga(s)).",
                LocalDateTime.now()
        );

        publicarEventoSeguro(evento, actualizado);

        return PedidoMapper.toResponse(actualizado);
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

            BigDecimal pesoReferencia = prenda.getPesoReferenciaKg();
            validarPesoReferencia(prenda);
            BigDecimal pesoEstimado = pesoReferencia.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setPesoReferenciaKg(pesoReferencia);
            detalle.setPesoEstimadoKg(pesoEstimado.setScale(ESCALA_PESO, RoundingMode.HALF_UP));
            detalle.setPrecioPorCarga(servicio.getPrecio());
            detalle.setCantidad(item.getCantidad());
            detalle.setObservaciones(item.getObservaciones());
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

            BigDecimal pesoReferencia = prenda.getPesoReferenciaKg();
            validarPesoReferencia(prenda);
            BigDecimal pesoEstimado = pesoReferencia.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoEntity detalle = new DetallePedidoEntity();
            detalle.setPedido(pedido);
            detalle.setServicio(servicio);
            detalle.setPrenda(prenda);
            detalle.setPesoReferenciaKg(pesoReferencia);
            detalle.setPesoEstimadoKg(pesoEstimado.setScale(ESCALA_PESO, RoundingMode.HALF_UP));
            detalle.setPrecioPorCarga(servicio.getPrecio());
            detalle.setCantidad(item.getCantidad());
            detalle.setObservaciones(item.getObservaciones());
            detalles.add(detalle);

        }
        return detalles;
    }

    /* ACTUALIZAR TOTAL */
    private BigDecimal obtenerPrecioPorCarga(List<DetallePedidoEntity> detalles) {
        long serviciosDistintos = detalles.stream()
                .map(detalle -> detalle.getServicio().getIdServicio())
                .distinct()
                .count();

        if (serviciosDistintos != 1) {
            throw new IllegalArgumentException("Todas las prendas del pedido deben usar el mismo servicio");
        }

        return detalles.getFirst().getPrecioPorCarga();
    }

    private BigDecimal calcularPrecio(BigDecimal precioPorCarga, int cargas) {
        return precioPorCarga.multiply(BigDecimal.valueOf(cargas))
                .setScale(ESCALA_DINERO, RoundingMode.HALF_UP);
    }

    private int calcularCargas(BigDecimal pesoKg) {
        return pesoKg.divide(KG_POR_CARGA, 0, RoundingMode.CEILING).intValueExact();
    }

    private BigDecimal calcularPesoEstimado(List<DetallePedidoEntity> detalles) {
        return detalles.stream()
                .map(DetallePedidoEntity::getPesoEstimadoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(ESCALA_PESO, RoundingMode.HALF_UP);
    }

    private void validarPesoReferencia(PrendaEntity prenda) {
        if (prenda.getPesoReferenciaKg() == null || prenda.getPesoReferenciaKg().signum() <= 0) {
            throw new IllegalStateException(
                    "La prenda " + prenda.getNombrePrenda() + " no tiene un peso de referencia válido"
            );
        }
    }

    /* VALIDAR PEDIDO EDITABLE */
    private void validarPedidoEditable(PedidoEntity pedido){
        if (pedido.getEstado() != EstadoPedido.REVISION) {
            throw new IllegalStateException("Solo se pueden editar pedidos en estado REVISION");
        }
    }

    /* VALIDAR CAMBIO DE ESTADO */
    private void validarCambioEstado(EstadoPedido actual, EstadoPedido nuevo) {
        if (actual == EstadoPedido.ENTREGADO || actual == EstadoPedido.CANCELADO) {
            throw new IllegalStateException("El pedido no puede cambiar de estado");
        }

        if (actual == nuevo) {
            throw new IllegalStateException("El pedido ya tiene ese estado");
        }

        if (actual == EstadoPedido.REVISION && nuevo != EstadoPedido.CANCELADO) {
            throw new IllegalStateException(
                    "Un pedido en REVISION solo puede cancelarse o confirmarse registrando su peso real"
            );
        }
    }

    private void publicarEventoSeguro(PedidoEstadoCambiadoEvent evento, PedidoEntity pedido) {
        try {
            pedidoEventProducer.publicarCambioEstado(evento);
        } catch (Exception exception) {
            log.error(
                    "El pedido {} fue actualizado, pero no se pudo publicar la notificación: {}",
                    pedido.getIdPedido(), exception.getMessage()
            );
        }
    }

    /* MANDAR NOTIFICACIONES POR ESTADO DE PEDIDO */
    private void notificarEstadoPedido(PedidoEntity pedido) {
        String mensaje = switch (pedido.getEstado()) {
            case REVISION ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " fue registrado y está en revisión.";

            case CONFIRMADO ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " fue revisado y confirmado.";

            case EN_PROCESO ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " se encuentra en proceso.";

            case COMPLETADO ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " está completado y listo para continuar con la entrega.";

            case ENTREGADO ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " fue entregado. Gracias por preferir LavaClean.";

            case CANCELADO ->
                    "Tu pedido #" + pedido.getIdPedido()
                            + " fue cancelado.";

            case PAGADO ->
                    "El pago de tu pedido #" + pedido.getIdPedido()
                            + " fue registrado correctamente.";
        };

        PedidoEstadoCambiadoEvent evento = new PedidoEstadoCambiadoEvent(
                UUID.randomUUID(),
                pedido.getIdPedido(),
                pedido.getIdUsuario(),
                pedido.getEstado().name(),
                "ESTADO_PEDIDO_" + pedido.getEstado().name(),
                mensaje,
                LocalDateTime.now()
        );

        try {
            pedidoEventProducer.publicarCambioEstado(evento);

            log.info(
                    "Notificación enviada para pedido {} con estado {}",
                    pedido.getIdPedido(),
                    pedido.getEstado()
            );
        } catch (Exception exception) {
            log.error(
                    "El pedido {} cambió a {}, pero no se pudo enviar la notificación: {}",
                    pedido.getIdPedido(),
                    pedido.getEstado(),
                    exception.getMessage()
            );
        }
    }





}
