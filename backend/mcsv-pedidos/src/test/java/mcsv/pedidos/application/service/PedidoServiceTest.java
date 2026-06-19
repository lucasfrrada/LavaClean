package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import mcsv.pedidos.api.dto.request.Pedido.ActualizarEstadoPedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.CrearDetallePedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.CrearPedidoRequest;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.api.dto.response.UsuarioResponseRest;
import mcsv.pedidos.domain.model.EstadoPedido;
import mcsv.pedidos.infraestructure.client.UsuarioClientRest;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PedidoRepository;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private PrendaRepository prendaRepository;

    @Mock
    private ServicioRepository servicioRepository;

    @Mock
    private UsuarioClientRest usuarioClientRest;

    @InjectMocks
    private PedidoService pedidoService;

    private PrendaEntity prenda;
    private ServicioEntity servicio;
    private UsuarioResponseRest usuario;

    @BeforeEach
    void setUp() {
        prenda = PrendaEntity.builder()
                .idPrenda(1L)
                .nombrePrenda("Camisa")
                .categoria("Ropa")
                .build();

        servicio = ServicioEntity.builder()
                .idServicio(1L)
                .tipoServicio("Lavado")
                .precio(new BigDecimal("3000"))
                .build();

        usuario = new UsuarioResponseRest();
        usuario.setIdUsuario(1L);
        usuario.setNombres("Benjamín");
        usuario.setApPaterno("Aranda");
        usuario.setApMaterno("Test");
        usuario.setCorreo("cliente@test.com");
        usuario.setTelefono(999999999L);
    }

    @Test
    void deberiaCrearPedidoConEstadoPendienteYTotalCorrecto() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setFecha_llegada(LocalDate.of(2026, 6, 18));
        request.setFecha_entrega(LocalDate.of(2026, 6, 19));

        CrearDetallePedidoRequest detalle = new CrearDetallePedidoRequest();
        detalle.setIdPrenda(1L);
        detalle.setIdServicio(1L);
        detalle.setCantidad(2);
        detalle.setObservaciones("Mancha difícil");

        request.setDetalles(List.of(detalle));

        when(usuarioClientRest.getUsuario(1L)).thenReturn(usuario);
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));
        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));

        when(pedidoRepository.save(any(PedidoEntity.class))).thenAnswer(invocation -> {
            PedidoEntity pedido = invocation.getArgument(0);
            pedido.setIdPedido(1L);
            return pedido;
        });

        PedidoResponse response = pedidoService.save(request);

        assertThat(response).isNotNull();
        assertThat(response.getIdPedido()).isEqualTo(1L);
        assertThat(response.getIdUsuario()).isEqualTo(1L);
        assertThat(response.getEstado()).isEqualTo("PENDIENTE");
        assertThat(response.getTotal()).isEqualByComparingTo("6000");

        ArgumentCaptor<PedidoEntity> pedidoCaptor = ArgumentCaptor.forClass(PedidoEntity.class);
        verify(pedidoRepository).save(pedidoCaptor.capture());

        PedidoEntity pedidoGuardado = pedidoCaptor.getValue();

        assertThat(pedidoGuardado.getEstado()).isEqualTo(EstadoPedido.REVISION);
        assertThat(pedidoGuardado.getTotal()).isEqualByComparingTo("6000");
        assertThat(pedidoGuardado.getDetallePedido()).hasSize(1);
        assertThat(pedidoGuardado.getDetallePedido().get(0).getCantidad()).isEqualTo(2);
        assertThat(pedidoGuardado.getDetallePedido().get(0).getPrecioUnitario()).isEqualByComparingTo("3000");
        assertThat(pedidoGuardado.getDetallePedido().get(0).getSubtotal()).isEqualByComparingTo("6000");
    }

    @Test
    void deberiaLanzarErrorSiLaPrendaNoExiste() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setFecha_llegada(LocalDate.of(2026, 6, 18));
        request.setFecha_entrega(LocalDate.of(2026, 6, 19));

        CrearDetallePedidoRequest detalle = new CrearDetallePedidoRequest();
        detalle.setIdPrenda(99L);
        detalle.setIdServicio(1L);
        detalle.setCantidad(1);

        request.setDetalles(List.of(detalle));

        when(usuarioClientRest.getUsuario(1L)).thenReturn(usuario);
        when(prendaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pedidoService.save(request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Prenda no encontrado");

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void deberiaLanzarErrorSiElServicioNoExiste() {
        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setIdUsuario(1L);
        request.setFecha_llegada(LocalDate.of(2026, 6, 18));
        request.setFecha_entrega(LocalDate.of(2026, 6, 19));

        CrearDetallePedidoRequest detalle = new CrearDetallePedidoRequest();
        detalle.setIdPrenda(1L);
        detalle.setIdServicio(99L);
        detalle.setCantidad(1);

        request.setDetalles(List.of(detalle));

        when(usuarioClientRest.getUsuario(1L)).thenReturn(usuario);
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));
        when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pedidoService.save(request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Servicio no encontrada");

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void deberiaActualizarEstadoDelPedido() {
        PedidoEntity pedido = PedidoEntity.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado(EstadoPedido.REVISION)
                .fecha_llegada(LocalDate.of(2026, 6, 18))
                .fecha_entrega(LocalDate.of(2026, 6, 19))
                .total(new BigDecimal("6000"))
                .detallePedido(List.of())
                .build();

        ActualizarEstadoPedidoRequest request = new ActualizarEstadoPedidoRequest();
        request.setEstado(EstadoPedido.EN_PROCESO);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(PedidoEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoResponse response = pedidoService.actualizarEstado(1L, request);

        assertThat(response.getEstado()).isEqualTo("EN_PROCESO");

        verify(pedidoRepository).save(pedido);
    }

    @Test
    void noDeberiaActualizarEstadoSiEsElMismoEstado() {
        PedidoEntity pedido = PedidoEntity.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado(EstadoPedido.REVISION)
                .total(new BigDecimal("6000"))
                .detallePedido(List.of())
                .build();

        ActualizarEstadoPedidoRequest request = new ActualizarEstadoPedidoRequest();
        request.setEstado(EstadoPedido.REVISION);

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> pedidoService.actualizarEstado(1L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("El pedido ya tiene ese estado");

        verify(pedidoRepository, never()).save(any());
    }

    @Test
    void noDeberiaEliminarPedidoEntregado() {
        PedidoEntity pedido = PedidoEntity.builder()
                .idPedido(1L)
                .estado(EstadoPedido.ENTREGADO)
                .build();

        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> pedidoService.eliminarPedido(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Este pedido no puede ser eliminado");

        verify(pedidoRepository, never()).delete(any());
    }
}