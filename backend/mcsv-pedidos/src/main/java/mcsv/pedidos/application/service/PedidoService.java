package mcsv.pedidos.application.service;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.pedidos.api.dto.request.Pedido.*;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.application.mapper.PedidoMapper;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;
import mcsv.pedidos.infraestructure.client.UsuarioClientRest;
import mcsv.pedidos.infraestructure.messaging.PedidoEstadoCambiadoEvent;
import mcsv.pedidos.infraestructure.messaging.PedidoEventProducer;
import mcsv.pedidos.infraestructure.persistence.entity.*;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final int ESCALA_PESO = 3;
    private static final int ESCALA_DINERO = 2;
    private static final BigDecimal KG_POR_CARGA = new BigDecimal("5");
    private static final BigDecimal PESO_MINIMO_CARGA = new BigDecimal("0.5");

    private final PedidoRepository pedidoRepository;
    private final PrendaRepository prendaRepository;
    private final ServicioRepository servicioRepository;
    private final UsuarioClientRest usuarioClientRest;
    private final PedidoEventProducer pedidoEventProducer;

    @Transactional
    public PedidoResponse save(CrearPedidoRequest request) {
        validarUsuario(request.getIdUsuario());
        boolean contratoLegado = request.getIdServicioBase() == null;
        if (contratoLegado && request.getDetalles() != null) {
            request.getDetalles().forEach(detalle -> prendaRepository.findById(detalle.getIdPrenda())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Prenda no encontrado: " + detalle.getIdPrenda())));
        }
        ServicioEntity base = resolverServicioBase(request.getIdServicioBase(), request.getDetalles());

        PedidoEntity pedido = new PedidoEntity();
        pedido.setIdUsuario(request.getIdUsuario());
        pedido.setFecha_llegada(request.getFecha_llegada());
        pedido.setFecha_entrega(request.getFecha_entrega());
        pedido.setObservacionesCliente(request.getObservacionesCliente());
        pedido.setObservacionesInternas(request.getObservacionesInternas());

        List<DetallePedidoEntity> detalles = construirDetalles(
                request.getDetalles(), pedido, base, contratoLegado);
        List<PedidoServicioEntity> servicios = new ArrayList<>();
        servicios.add(construirSeleccion(base, TipoServicio.BASE, request.getOpcionBaseCodigo(),
                calcularCantidadServicioBase(base, detalles),
                request.getObservacionesServicioBase(), pedido));
        servicios.addAll(construirExtras(request.getServiciosExtras(), pedido, base.getIdServicio()));

        pedido.setDetallePedido(detalles);
        pedido.setServicios(servicios);
        recalcularEstimado(pedido, base, contratoLegado);

        return PedidoMapper.toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public List<PedidoResponse> listarPedidos() {
        return pedidoRepository.findAll().stream().map(PedidoMapper::toResponse).toList();
    }

    @Transactional
    public PedidoResponse findById(Long id) {
        return PedidoMapper.toResponse(buscarPedido(id));
    }

    @Transactional
    public List<PedidoResponse> findByIdUsuario(Long idUsuario) {
        return pedidoRepository.findByIdUsuario(idUsuario).stream()
                .map(PedidoMapper::toResponse).toList();
    }

    @Transactional
    public PedidoResponse actualizarPedido(Long id, ActualizarPedidoRequest request) {
        PedidoEntity pedido = buscarPedido(id);
        validarPedidoEditable(pedido);
        ServicioEntity base = request.getIdServicioBase() == null
                ? obtenerBaseActual(pedido)
                : validarServicio(request.getIdServicioBase(), TipoServicio.BASE);

        pedido.setFecha_llegada(request.getFecha_llegada());
        pedido.setFecha_entrega(request.getFecha_entrega());
        pedido.setObservacionesCliente(request.getObservacionesCliente());
        pedido.setObservacionesInternas(request.getObservacionesInternas());

        pedido.getDetallePedido().clear();
        List<DetallePedidoEntity> detalles = construirDetallesActualizar(
                request.getDetalles(), pedido, base);
        pedido.getDetallePedido().addAll(detalles);
        pedido.getServicios().clear();
        pedido.getServicios().add(construirSeleccion(base, TipoServicio.BASE,
                request.getOpcionBaseCodigo(), calcularCantidadServicioBase(base, detalles),
                request.getObservacionesServicioBase(), pedido));
        pedido.getServicios().addAll(construirExtras(
                request.getServiciosExtras(), pedido, base.getIdServicio()));
        recalcularEstimado(pedido, base, false);
        return PedidoMapper.toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse agregarServiciosExtras(Long id, AgregarServiciosExtrasRequest request) {
        PedidoEntity pedido = buscarPedido(id);
        validarPedidoEditable(pedido);
        ServicioEntity base = obtenerBaseActual(pedido);
        Set<Long> existentes = new HashSet<>();
        pedido.getServicios().forEach(item -> existentes.add(item.getServicio().getIdServicio()));
        for (SeleccionServicioRequest extra : request.getServiciosExtras()) {
            if (!existentes.add(extra.getIdServicio())) {
                throw new IllegalArgumentException("El servicio ya está incluido en el pedido");
            }
        }
        pedido.getServicios().addAll(construirExtras(request.getServiciosExtras(), pedido,
                base.getIdServicio()));
        recalcularEstimado(pedido, base, false);
        return PedidoMapper.toResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse actualizarEstado(Long id, ActualizarEstadoPedidoRequest request) {
        PedidoEntity pedido = buscarPedido(id);
        EstadoPedido nuevo = request.getEstado();
        validarCambioEstado(pedido, nuevo);
        if (nuevo == EstadoPedido.CONFIRMADO && pedido.getPrecioFinal() == null) {
            pedido.setPrecioFinal(pedido.getPrecioEstimado());
            pedido.setTotal(pedido.getPrecioFinal());
            pedido.getServicios().forEach(servicio -> servicio.setPrecioFinal(servicio.getPrecioEstimado()));
        }
        pedido.setEstado(nuevo);
        PedidoEntity actualizado = pedidoRepository.save(pedido);
        publicarEventoSeguro(crearEvento(actualizado, "CAMBIO_ESTADO",
                "Tu pedido #" + id + " cambió al estado " + nuevo), actualizado);
        return PedidoMapper.toResponse(actualizado);
    }

    @Transactional
    public PedidoResponse confirmarPesoReal(Long id, ConfirmarPesoRealRequest request) {
        PedidoEntity pedido = buscarPedido(id);
        if (pedido.getEstado() != EstadoPedido.PENDIENTE_PESAJE
                && pedido.getEstado() != EstadoPedido.REVISION) {
            throw new IllegalStateException("El pedido no está pendiente de pesaje");
        }
        if (request.getPesoRealKg().compareTo(PESO_MINIMO_CARGA) < 0) {
            throw new IllegalArgumentException("El peso real mínimo para lavado por carga es 0,5 kg");
        }

        int cargasReales = calcularCargas(request.getPesoRealKg());
        BigDecimal precioBaseFinal;
        BigDecimal extras = BigDecimal.ZERO;
        if (pedido.getServicios().isEmpty()) {
            precioBaseFinal = dinero(pedido.getPrecioPorCarga()
                    .multiply(BigDecimal.valueOf(cargasReales)));
        } else {
            ServicioEntity base = obtenerBaseActual(pedido);
            if (modalidad(base, false) != ModalidadCobro.POR_CARGA) {
                throw new IllegalStateException("El servicio base no se cobra por peso");
            }
            PedidoServicioEntity seleccionBase = obtenerSeleccionBase(pedido);
            precioBaseFinal = dinero(seleccionBase.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(cargasReales)));
            seleccionBase.setPrecioFinal(precioBaseFinal);
            pedido.getServicios().stream()
                    .filter(servicio -> servicio.getTipo() == TipoServicio.EXTRA)
                    .forEach(servicio -> servicio.setPrecioFinal(servicio.getPrecioEstimado()));
            extras = totalExtras(pedido, true);
        }

        pedido.setPesoRealKg(request.getPesoRealKg().setScale(ESCALA_PESO, RoundingMode.HALF_UP));
        pedido.setCargasReales(cargasReales);
        pedido.setPrecioFinal(dinero(precioBaseFinal.add(extras)));
        pedido.setTotal(pedido.getPrecioFinal());
        pedido.setEstado(EstadoPedido.CONFIRMADO);

        PedidoEntity actualizado = pedidoRepository.save(pedido);
        publicarEventoSeguro(crearEvento(actualizado, "PESO_REAL_CONFIRMADO",
                "Peso real confirmado: " + actualizado.getPesoRealKg() + " kg. Total: $"
                        + actualizado.getPrecioFinal().setScale(0, RoundingMode.HALF_UP)), actualizado);
        return PedidoMapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminarPedido(Long id) {
        PedidoEntity pedido = buscarPedido(id);
        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new IllegalStateException("Este pedido no puede ser eliminado");
        }
        pedidoRepository.delete(pedido);
    }

    private void recalcularEstimado(PedidoEntity pedido, ServicioEntity base, boolean contratoLegado) {
        ModalidadCobro modalidad = modalidad(base, contratoLegado);
        PedidoServicioEntity seleccionBase = obtenerSeleccionBase(pedido);
        BigDecimal precioBase;

        if (modalidad == ModalidadCobro.POR_CARGA) {
            if (pedido.getDetallePedido().isEmpty()) {
                throw new IllegalArgumentException(
                        "Lavado por carga requiere prendas para calcular el peso estimado");
            }
            BigDecimal peso = calcularPesoEstimado(pedido.getDetallePedido());
            if (!contratoLegado && peso.compareTo(PESO_MINIMO_CARGA) < 0) {
                throw new IllegalArgumentException("El peso estimado mínimo es 0,5 kg");
            }
            int cargas = calcularCargas(peso);
            precioBase = dinero(seleccionBase.getPrecioUnitario().multiply(BigDecimal.valueOf(cargas)));
            pedido.setPesoEstimadoKg(peso);
            pedido.setCargasEstimadas(cargas);
            pedido.setPrecioPorCarga(seleccionBase.getPrecioUnitario());
            pedido.setEstado(contratoLegado ? EstadoPedido.REVISION : EstadoPedido.PENDIENTE_PESAJE);
        } else {
            precioBase = dinero(seleccionBase.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(seleccionBase.getCantidad())));
            pedido.setPesoEstimadoKg(null);
            pedido.setCargasEstimadas(null);
            pedido.setPrecioPorCarga(null);
            pedido.setEstado(EstadoPedido.PENDIENTE_CONFIRMACION);
        }

        seleccionBase.setPrecioEstimado(precioBase);
        BigDecimal total = dinero(precioBase.add(totalExtras(pedido, false)));
        pedido.setPrecioEstimado(total);
        pedido.setPrecioFinal(null);
        pedido.setPesoRealKg(null);
        pedido.setCargasReales(null);
        pedido.setTotal(total);
    }

    private ServicioEntity resolverServicioBase(Long idServicioBase,
            List<CrearDetallePedidoRequest> detalles) {
        if (idServicioBase != null) return validarServicio(idServicioBase, TipoServicio.BASE);
        if (detalles == null || detalles.isEmpty() || detalles.getFirst().getIdServicio() == null) {
            throw new IllegalArgumentException("El servicio base es obligatorio");
        }
        Long idLegado = detalles.getFirst().getIdServicio();
        if (detalles.stream().anyMatch(detalle -> !Objects.equals(idLegado, detalle.getIdServicio()))) {
            throw new IllegalArgumentException("Todas las prendas deben usar el mismo servicio base");
        }
        return servicioRepository.findById(idLegado)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrada: " + idLegado));
    }

    private ServicioEntity validarServicio(Long id, TipoServicio tipoEsperado) {
        ServicioEntity servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado: " + id));
        if (Boolean.FALSE.equals(servicio.getActivo())) {
            throw new IllegalArgumentException("El servicio no está activo");
        }
        if (servicio.getTipo() != tipoEsperado) {
            throw new IllegalArgumentException("El servicio debe ser de tipo " + tipoEsperado);
        }
        return servicio;
    }

    private PedidoServicioEntity construirSeleccion(ServicioEntity servicio, TipoServicio tipo,
            String opcionCodigo, Integer cantidad, String observaciones, PedidoEntity pedido) {
        int cantidadValida = cantidad == null ? 1 : cantidad;
        BigDecimal precio = servicio.getPrecio();
        String opcionNombre = null;
        if (modalidad(servicio, false) == ModalidadCobro.POR_OPCION) {
            String codigoBuscado = Objects.toString(opcionCodigo, "");
            ServicioOpcionEntity opcion = servicio.getOpciones().stream()
                    .filter(item -> Boolean.TRUE.equals(item.getActivo()))
                    .filter(item -> item.getCodigo().equalsIgnoreCase(codigoBuscado))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Debe seleccionar una opción válida para " + servicio.getTipoServicio()));
            precio = opcion.getPrecio();
            opcionCodigo = opcion.getCodigo();
            opcionNombre = opcion.getNombre();
        }
        if (precio == null || precio.signum() < 0) {
            throw new IllegalStateException("El servicio no tiene un precio válido");
        }
        BigDecimal subtotal = dinero(precio.multiply(BigDecimal.valueOf(cantidadValida)));
        return PedidoServicioEntity.builder()
                .pedido(pedido).servicio(servicio).tipo(tipo)
                .opcionCodigo(opcionCodigo).opcionNombre(opcionNombre)
                .cantidad(cantidadValida).observaciones(observaciones)
                .precioUnitario(dinero(precio)).precioEstimado(subtotal).build();
    }

    private List<PedidoServicioEntity> construirExtras(List<SeleccionServicioRequest> requests,
            PedidoEntity pedido, Long idBase) {
        if (requests == null) return List.of();
        Set<Long> ids = new HashSet<>();
        List<PedidoServicioEntity> extras = new ArrayList<>();
        for (SeleccionServicioRequest request : requests) {
            if (Objects.equals(idBase, request.getIdServicio())) {
                throw new IllegalArgumentException("El servicio base no puede repetirse como extra");
            }
            if (!ids.add(request.getIdServicio())) {
                throw new IllegalArgumentException("No se puede repetir un servicio extra");
            }
            ServicioEntity extra = validarServicio(request.getIdServicio(), TipoServicio.EXTRA);
            extras.add(construirSeleccion(extra, TipoServicio.EXTRA, request.getOpcionCodigo(),
                    request.getCantidad(), request.getObservaciones(), pedido));
        }
        return extras;
    }

    private List<DetallePedidoEntity> construirDetalles(List<CrearDetallePedidoRequest> items,
            PedidoEntity pedido, ServicioEntity base, boolean contratoLegado) {
        if (items == null) return new ArrayList<>();
        List<DetallePedidoEntity> detalles = new ArrayList<>();
        for (CrearDetallePedidoRequest item : items) {
            if (item.getIdServicio() != null && !Objects.equals(item.getIdServicio(), base.getIdServicio())) {
                throw new IllegalArgumentException("Los detalles solo pueden usar el servicio base");
            }
            detalles.add(crearDetalle(item.getIdPrenda(), item.getCantidad(),
                    item.getObservaciones(), pedido, base, contratoLegado));
        }
        return detalles;
    }

    private List<DetallePedidoEntity> construirDetallesActualizar(
            List<ActualizarDetallePedidoRequest> items, PedidoEntity pedido, ServicioEntity base) {
        if (items == null) return new ArrayList<>();
        List<DetallePedidoEntity> detalles = new ArrayList<>();
        for (ActualizarDetallePedidoRequest item : items) {
            if (item.getServicioId() != null && !Objects.equals(item.getServicioId(), base.getIdServicio())) {
                throw new IllegalArgumentException("Los detalles solo pueden usar el servicio base");
            }
            detalles.add(crearDetalle(item.getPrendaId(), item.getCantidad(),
                    item.getObservaciones(), pedido, base, false));
        }
        return detalles;
    }

    private DetallePedidoEntity crearDetalle(Long idPrenda, Integer cantidad, String observaciones,
            PedidoEntity pedido, ServicioEntity base, boolean contratoLegado) {
        PrendaEntity prenda = prendaRepository.findById(idPrenda)
                .orElseThrow(() -> new EntityNotFoundException("Prenda no encontrada: " + idPrenda));
        boolean requierePeso = contratoLegado
                || modalidad(base, false) == ModalidadCobro.POR_CARGA;
        if (requierePeso) validarPesoReferencia(prenda);
        DetallePedidoEntity detalle = new DetallePedidoEntity();
        detalle.setPedido(pedido);
        detalle.setServicio(base);
        detalle.setPrenda(prenda);
        detalle.setCantidad(cantidad);
        detalle.setObservaciones(observaciones);
        if (prenda.getPesoReferenciaKg() != null) {
            detalle.setPesoReferenciaKg(prenda.getPesoReferenciaKg());
            detalle.setPesoEstimadoKg(prenda.getPesoReferenciaKg()
                    .multiply(BigDecimal.valueOf(cantidad))
                    .setScale(ESCALA_PESO, RoundingMode.HALF_UP));
        }
        detalle.setPrecioPorCarga(requierePeso ? base.getPrecio() : null);
        return detalle;
    }

    private int calcularCantidadServicioBase(ServicioEntity base,
            List<DetallePedidoEntity> detalles) {
        if (modalidad(base, false) != ModalidadCobro.POR_OPCION || detalles.isEmpty()) {
            return 1;
        }
        return detalles.stream()
                .map(DetallePedidoEntity::getCantidad)
                .reduce(0, Math::addExact);
    }

    private BigDecimal totalExtras(PedidoEntity pedido, boolean finalizado) {
        return pedido.getServicios().stream()
                .filter(servicio -> servicio.getTipo() == TipoServicio.EXTRA)
                .map(servicio -> finalizado && servicio.getPrecioFinal() != null
                        ? servicio.getPrecioFinal() : servicio.getPrecioEstimado())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private ServicioEntity obtenerBaseActual(PedidoEntity pedido) {
        if (!pedido.getServicios().isEmpty()) return obtenerSeleccionBase(pedido).getServicio();
        if (!pedido.getDetallePedido().isEmpty()) return pedido.getDetallePedido().getFirst().getServicio();
        throw new IllegalStateException("El pedido no tiene servicio base");
    }

    private PedidoServicioEntity obtenerSeleccionBase(PedidoEntity pedido) {
        return pedido.getServicios().stream()
                .filter(servicio -> servicio.getTipo() == TipoServicio.BASE)
                .findFirst().orElseThrow(() -> new IllegalStateException("El pedido no tiene servicio base"));
    }

    private ModalidadCobro modalidad(ServicioEntity servicio, boolean legado) {
        if (legado) return ModalidadCobro.POR_CARGA;
        if (servicio.getModalidadCobro() != null) return servicio.getModalidadCobro();
        return ModalidadCobro.FIJO;
    }

    private int calcularCargas(BigDecimal pesoKg) {
        return pesoKg.divide(KG_POR_CARGA, 0, RoundingMode.CEILING).intValueExact();
    }

    private BigDecimal calcularPesoEstimado(List<DetallePedidoEntity> detalles) {
        return detalles.stream().map(DetallePedidoEntity::getPesoEstimadoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(ESCALA_PESO, RoundingMode.HALF_UP);
    }

    private BigDecimal dinero(BigDecimal valor) {
        return valor.setScale(ESCALA_DINERO, RoundingMode.HALF_UP);
    }

    private void validarPesoReferencia(PrendaEntity prenda) {
        if (prenda.getPesoReferenciaKg() == null || prenda.getPesoReferenciaKg().signum() <= 0) {
            throw new IllegalStateException("La prenda no tiene un peso de referencia válido");
        }
    }

    private void validarUsuario(Long idUsuario) {
        try {
            usuarioClientRest.getUsuario(idUsuario);
        } catch (FeignException.NotFound ex) {
            throw new EntityNotFoundException("Usuario con ID: " + idUsuario + " no encontrado");
        }
    }

    private PedidoEntity buscarPedido(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido no encontrado con id: " + id));
    }

    private void validarPedidoEditable(PedidoEntity pedido) {
        if (pedido.getEstado() != EstadoPedido.PENDIENTE_CONFIRMACION
                && pedido.getEstado() != EstadoPedido.PENDIENTE_PESAJE
                && pedido.getEstado() != EstadoPedido.REVISION) {
            throw new IllegalStateException("El pedido ya no se puede editar");
        }
    }

    private void validarCambioEstado(PedidoEntity pedido, EstadoPedido nuevo) {
        EstadoPedido actual = pedido.getEstado();
        if (actual == nuevo) throw new IllegalStateException("El pedido ya tiene ese estado");
        if (actual == EstadoPedido.ENTREGADO || actual == EstadoPedido.CANCELADO) {
            throw new IllegalStateException("El pedido no puede cambiar de estado");
        }
        if ((actual == EstadoPedido.PENDIENTE_PESAJE
                || (actual == EstadoPedido.REVISION && requiereConfirmacionPeso(pedido)))
                && nuevo != EstadoPedido.CANCELADO) {
            throw new IllegalStateException("Debe confirmar el peso real antes de cambiar el estado");
        }
    }

    private boolean requiereConfirmacionPeso(PedidoEntity pedido) {
        if (pedido.getServicios() == null || pedido.getServicios().isEmpty()) {
            return true;
        }
        return modalidad(obtenerBaseActual(pedido), false) == ModalidadCobro.POR_CARGA;
    }

    private PedidoEstadoCambiadoEvent crearEvento(PedidoEntity pedido, String tipo, String mensaje) {
        return new PedidoEstadoCambiadoEvent(UUID.randomUUID(), pedido.getIdPedido(),
                pedido.getIdUsuario(), pedido.getEstado().name(), tipo, mensaje, LocalDateTime.now());
    }

    private void publicarEventoSeguro(PedidoEstadoCambiadoEvent evento, PedidoEntity pedido) {
        try {
            pedidoEventProducer.publicarCambioEstado(evento);
        } catch (Exception exception) {
            log.error("Pedido {} actualizado sin notificación: {}",
                    pedido.getIdPedido(), exception.getMessage());
        }
    }
}
