package mcsv.pedidos.application.service;

import mcsv.pedidos.api.dto.request.Pedido.CrearDetallePedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.CrearPedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.SeleccionServicioRequest;
import mcsv.pedidos.api.dto.request.Pedido.ActualizarEstadoPedidoRequest;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.api.dto.response.UsuarioResponseRest;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;
import mcsv.pedidos.infraestructure.client.UsuarioClientRest;
import mcsv.pedidos.infraestructure.messaging.PedidoEventProducer;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoServicioEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioOpcionEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class PedidoNuevaLogicaServiceTest {

    @Mock PedidoRepository pedidoRepository;
    @Mock PrendaRepository prendaRepository;
    @Mock ServicioRepository servicioRepository;
    @Mock UsuarioClientRest usuarioClientRest;
    @Mock PedidoEventProducer pedidoEventProducer;
    @InjectMocks PedidoService pedidoService;

    @BeforeEach
    void preparar() {
        lenient().when(usuarioClientRest.getUsuario(1L)).thenReturn(new UsuarioResponseRest());
        lenient().when(pedidoRepository.save(any(PedidoEntity.class))).thenAnswer(invocacion -> {
            PedidoEntity pedido = invocacion.getArgument(0);
            pedido.setIdPedido(10L);
            return pedido;
        });
    }

    @Test
    void calculaServicioBasePorCargaMasExtras() {
        ServicioEntity base = servicio(1L, "Lavado por Carga", TipoServicio.BASE,
                ModalidadCobro.POR_CARGA, "5000");
        ServicioEntity extra = servicio(2L, "Quita manchas", TipoServicio.EXTRA,
                ModalidadCobro.FIJO, "2500");
        PrendaEntity prenda = PrendaEntity.builder().idPrenda(1L).nombrePrenda("Polera")
                .categoria("Ropa").pesoReferenciaKg(new BigDecimal("0.2")).build();
        when(servicioRepository.findById(1L)).thenReturn(Optional.of(base));
        when(servicioRepository.findById(2L)).thenReturn(Optional.of(extra));
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));

        CrearDetallePedidoRequest detalle = new CrearDetallePedidoRequest();
        detalle.setIdPrenda(1L);
        detalle.setCantidad(26);
        SeleccionServicioRequest seleccionExtra = new SeleccionServicioRequest();
        seleccionExtra.setIdServicio(2L);

        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setIdServicioBase(1L);
        request.setDetalles(List.of(detalle));
        request.setServiciosExtras(List.of(seleccionExtra));

        PedidoResponse response = pedidoService.save(request);

        assertThat(response.getEstado()).isEqualTo("PENDIENTE_PESAJE");
        assertThat(response.getPesoEstimadoKg()).isEqualByComparingTo("5.2");
        assertThat(response.getCargasEstimadas()).isEqualTo(2);
        assertThat(response.getPrecioEstimado()).isEqualByComparingTo("12500");
        assertThat(response.getServiciosExtras()).hasSize(1);
    }

    @Test
    void calculaServicioBaseSegunOpcionSinPrendas() {
        ServicioEntity base = servicio(3L, "Lavado de Chaqueta", TipoServicio.BASE,
                ModalidadCobro.POR_OPCION, "0");
        base.setOpciones(List.of(ServicioOpcionEntity.builder().servicio(base)
                .codigo("LARGA").nombre("Larga").precio(new BigDecimal("10000"))
                .activo(true).build()));
        when(servicioRepository.findById(3L)).thenReturn(Optional.of(base));

        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setIdServicioBase(3L);
        request.setOpcionBaseCodigo("LARGA");

        PedidoResponse response = pedidoService.save(request);

        assertThat(response.getEstado()).isEqualTo("PENDIENTE_CONFIRMACION");
        assertThat(response.getPrecioEstimado()).isEqualByComparingTo("10000");
        assertThat(response.getPesoEstimadoKg()).isNull();
        assertThat(response.getServicioBase().getOpcionNombre()).isEqualTo("Larga");
    }

    @Test
    void calculaServicioPorOpcionParaTodasLasPrendasDelPedido() {
        ServicioEntity base = servicio(3L, "Lavado de Chaqueta", TipoServicio.BASE,
                ModalidadCobro.POR_OPCION, "0");
        base.setOpciones(List.of(ServicioOpcionEntity.builder().servicio(base)
                .codigo("LARGA").nombre("Larga").precio(new BigDecimal("10000"))
                .activo(true).build()));
        PrendaEntity chaqueta = PrendaEntity.builder().idPrenda(1L)
                .nombrePrenda("Chaqueta").categoria("Abrigo").build();
        PrendaEntity abrigo = PrendaEntity.builder().idPrenda(2L)
                .nombrePrenda("Abrigo").categoria("Abrigo").build();
        when(servicioRepository.findById(3L)).thenReturn(Optional.of(base));
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(chaqueta));
        when(prendaRepository.findById(2L)).thenReturn(Optional.of(abrigo));

        CrearDetallePedidoRequest dosChaquetas = new CrearDetallePedidoRequest();
        dosChaquetas.setIdPrenda(1L);
        dosChaquetas.setCantidad(2);
        CrearDetallePedidoRequest unAbrigo = new CrearDetallePedidoRequest();
        unAbrigo.setIdPrenda(2L);
        unAbrigo.setCantidad(1);

        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setIdServicioBase(3L);
        request.setOpcionBaseCodigo("LARGA");
        request.setDetalles(List.of(dosChaquetas, unAbrigo));

        PedidoResponse response = pedidoService.save(request);

        assertThat(response.getEstado()).isEqualTo("PENDIENTE_CONFIRMACION");
        assertThat(response.getDetalles()).hasSize(2);
        assertThat(response.getServicioBase().getCantidad()).isEqualTo(3);
        assertThat(response.getPrecioEstimado()).isEqualByComparingTo("30000");
        assertThat(response.getPesoEstimadoKg()).isNull();
    }

    @Test
    void confirmaPedidoPorOpcionEnRevisionSinExigirPesoReal() {
        ServicioEntity base = servicio(3L, "Lavado de Chaqueta", TipoServicio.BASE,
                ModalidadCobro.POR_OPCION, "0");
        PedidoEntity pedido = PedidoEntity.builder()
                .idPedido(19L)
                .idUsuario(1L)
                .estado(EstadoPedido.REVISION)
                .precioEstimado(new BigDecimal("18000"))
                .total(new BigDecimal("18000"))
                .detallePedido(new ArrayList<>())
                .servicios(new ArrayList<>())
                .build();
        PedidoServicioEntity seleccionBase = PedidoServicioEntity.builder()
                .pedido(pedido)
                .servicio(base)
                .tipo(TipoServicio.BASE)
                .opcionCodigo("CORTA")
                .opcionNombre("Corta")
                .cantidad(3)
                .precioUnitario(new BigDecimal("6000"))
                .precioEstimado(new BigDecimal("18000"))
                .build();
        pedido.getServicios().add(seleccionBase);
        when(pedidoRepository.findById(19L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(PedidoEntity.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        ActualizarEstadoPedidoRequest request = new ActualizarEstadoPedidoRequest();
        request.setEstado(EstadoPedido.CONFIRMADO);

        PedidoResponse response = pedidoService.actualizarEstado(19L, request);

        assertThat(response.getEstado()).isEqualTo("CONFIRMADO");
        assertThat(response.getPesoRealKg()).isNull();
        assertThat(response.getPrecioFinal()).isEqualByComparingTo("18000");
        assertThat(response.getServicioBase().getPrecioFinal()).isEqualByComparingTo("18000");
    }

    @Test
    void mantieneConfirmacionDePesoParaPedidoPorCargaEnRevision() {
        ServicioEntity base = servicio(1L, "Lavado por Carga", TipoServicio.BASE,
                ModalidadCobro.POR_CARGA, "5000");
        PedidoEntity pedido = PedidoEntity.builder()
                .idPedido(20L)
                .idUsuario(1L)
                .estado(EstadoPedido.REVISION)
                .precioEstimado(new BigDecimal("10000"))
                .total(new BigDecimal("10000"))
                .detallePedido(new ArrayList<>())
                .servicios(new ArrayList<>())
                .build();
        pedido.getServicios().add(PedidoServicioEntity.builder()
                .pedido(pedido)
                .servicio(base)
                .tipo(TipoServicio.BASE)
                .cantidad(2)
                .precioUnitario(new BigDecimal("5000"))
                .precioEstimado(new BigDecimal("10000"))
                .build());
        when(pedidoRepository.findById(20L)).thenReturn(Optional.of(pedido));

        ActualizarEstadoPedidoRequest request = new ActualizarEstadoPedidoRequest();
        request.setEstado(EstadoPedido.CONFIRMADO);

        assertThatThrownBy(() -> pedidoService.actualizarEstado(20L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("confirmar el peso real");
    }

    @Test
    void rechazaServicioExtraComoBase() {
        ServicioEntity extra = servicio(2L, "Quita manchas", TipoServicio.EXTRA,
                ModalidadCobro.FIJO, "2500");
        when(servicioRepository.findById(2L)).thenReturn(Optional.of(extra));
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setIdServicioBase(2L);

        assertThatThrownBy(() -> pedidoService.save(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("BASE");
    }

    private ServicioEntity servicio(Long id, String nombre, TipoServicio tipo,
            ModalidadCobro modalidad, String precio) {
        return ServicioEntity.builder().idServicio(id).tipoServicio(nombre).tipo(tipo)
                .modalidadCobro(modalidad).precio(new BigDecimal(precio)).activo(true).build();
    }
}
