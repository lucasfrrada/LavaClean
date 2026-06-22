package mcsv.pedidos.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mcsv.pedidos.api.dto.request.Pedido.ActualizarEstadoPedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.CrearDetallePedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.CrearPedidoRequest;
import mcsv.pedidos.api.dto.request.Pedido.ConfirmarPesoRealRequest;
import mcsv.pedidos.api.dto.response.Pedido.PedidoResponse;
import mcsv.pedidos.application.service.PedidoService;
import mcsv.pedidos.domain.model.EstadoPedido;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PedidoControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        PedidoController pedidoController = new PedidoController(pedidoService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(pedidoController)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    void deberiaCrearPedidoYRetornarStatus201() throws Exception {
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

        PedidoResponse response = PedidoResponse.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado("PENDIENTE")
                .fechaLlegada(LocalDate.of(2026, 6, 18))
                .fechaEntrega(LocalDate.of(2026, 6, 19))
                .total(new BigDecimal("6000"))
                .detalles(List.of())
                .build();

        when(pedidoService.save(any(CrearPedidoRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPedido").value(1))
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.total").value(6000));

        verify(pedidoService).save(any(CrearPedidoRequest.class));
    }

    @Test
    void deberiaListarPedidosYRetornarStatus200() throws Exception {
        PedidoResponse pedido1 = PedidoResponse.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado("PENDIENTE")
                .fechaLlegada(LocalDate.of(2026, 6, 18))
                .fechaEntrega(LocalDate.of(2026, 6, 19))
                .total(new BigDecimal("6000"))
                .detalles(List.of())
                .build();

        PedidoResponse pedido2 = PedidoResponse.builder()
                .idPedido(2L)
                .idUsuario(2L)
                .estado("EN_PROCESO")
                .fechaLlegada(LocalDate.of(2026, 6, 20))
                .fechaEntrega(LocalDate.of(2026, 6, 21))
                .total(new BigDecimal("3000"))
                .detalles(List.of())
                .build();

        when(pedidoService.listarPedidos()).thenReturn(List.of(pedido1, pedido2));

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idPedido").value(1))
                .andExpect(jsonPath("$[0].estado").value("PENDIENTE"))
                .andExpect(jsonPath("$[1].idPedido").value(2))
                .andExpect(jsonPath("$[1].estado").value("EN_PROCESO"));

        verify(pedidoService).listarPedidos();
    }

    @Test
    void deberiaObtenerPedidoPorIdYRetornarStatus200() throws Exception {
        PedidoResponse response = PedidoResponse.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado("PENDIENTE")
                .fechaLlegada(LocalDate.of(2026, 6, 18))
                .fechaEntrega(LocalDate.of(2026, 6, 19))
                .total(new BigDecimal("6000"))
                .detalles(List.of())
                .build();

        when(pedidoService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/pedidos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPedido").value(1))
                .andExpect(jsonPath("$.idUsuario").value(1))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.total").value(6000));

        verify(pedidoService).findById(1L);
    }

    @Test
    void deberiaActualizarEstadoYRetornarStatus200() throws Exception {
        ActualizarEstadoPedidoRequest request = new ActualizarEstadoPedidoRequest();
        request.setEstado(EstadoPedido.EN_PROCESO);

        PedidoResponse response = PedidoResponse.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado("EN_PROCESO")
                .fechaLlegada(LocalDate.of(2026, 6, 18))
                .fechaEntrega(LocalDate.of(2026, 6, 19))
                .total(new BigDecimal("6000"))
                .detalles(List.of())
                .build();

        when(pedidoService.actualizarEstado(eq(1L), any(ActualizarEstadoPedidoRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/pedidos/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPedido").value(1))
                .andExpect(jsonPath("$.estado").value("EN_PROCESO"));

        verify(pedidoService).actualizarEstado(eq(1L), any(ActualizarEstadoPedidoRequest.class));
    }

    @Test
    void deberiaEliminarPedidoYRetornarStatus204() throws Exception {
        doNothing().when(pedidoService).eliminarPedido(1L);

        mockMvc.perform(delete("/api/pedidos/1"))
                .andExpect(status().isNoContent());

        verify(pedidoService).eliminarPedido(1L);
    }

    @Test
    void deberiaConfirmarPesoRealYRetornarValorFinal() throws Exception {
        ConfirmarPesoRealRequest request = new ConfirmarPesoRealRequest();
        request.setPesoRealKg(new BigDecimal("5.5"));

        PedidoResponse response = PedidoResponse.builder()
                .idPedido(1L)
                .idUsuario(1L)
                .estado("CONFIRMADO")
                .pesoEstimadoKg(new BigDecimal("5.6"))
                .pesoRealKg(new BigDecimal("5.5"))
                .precioEstimado(new BigDecimal("10000"))
                .precioPorCarga(new BigDecimal("5000"))
                .cargasEstimadas(2)
                .cargasReales(2)
                .precioFinal(new BigDecimal("10000"))
                .total(new BigDecimal("10000"))
                .detalles(List.of())
                .build();

        when(pedidoService.confirmarPesoReal(eq(1L), any(ConfirmarPesoRealRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/pedidos/1/confirmar-peso")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CONFIRMADO"))
                .andExpect(jsonPath("$.pesoRealKg").value(5.5))
                .andExpect(jsonPath("$.cargasReales").value(2))
                .andExpect(jsonPath("$.precioFinal").value(10000));
    }

}
