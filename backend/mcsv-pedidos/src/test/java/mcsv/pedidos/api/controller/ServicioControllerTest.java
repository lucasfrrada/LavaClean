package mcsv.pedidos.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mcsv.pedidos.api.dto.request.Servicio.ActualizarServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.CrearServicioRequest;
import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.application.service.ServicioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ServicioControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private ServicioService servicioService;

    @BeforeEach
    void setUp() {
        ServicioController servicioController = new ServicioController(servicioService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(servicioController)
                .build();

        objectMapper = new ObjectMapper();
    }

    @Test
    void deberiaCrearServicioYRetornarStatus201() throws Exception {
        CrearServicioRequest request = new CrearServicioRequest();
        request.setTipoServicio("Lavado");
        request.setPrecio(new BigDecimal("3000"));

        ServicioResponse response = ServicioResponse.builder()
                .idServicio(1L)
                .tipoServicio("Lavado")
                .precio(new BigDecimal("3000"))
                .build();

        when(servicioService.crearServicio(any(CrearServicioRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/servicios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idServicio").value(1))
                .andExpect(jsonPath("$.tipoServicio").value("Lavado"))
                .andExpect(jsonPath("$.precio").value(3000));

        verify(servicioService).crearServicio(any(CrearServicioRequest.class));
    }

    @Test
    void deberiaListarServiciosYRetornarStatus200() throws Exception {
        ServicioResponse lavado = ServicioResponse.builder()
                .idServicio(1L)
                .tipoServicio("Lavado")
                .precio(new BigDecimal("3000"))
                .build();

        ServicioResponse planchado = ServicioResponse.builder()
                .idServicio(2L)
                .tipoServicio("Planchado")
                .precio(new BigDecimal("2500"))
                .build();

        when(servicioService.listarServicios()).thenReturn(List.of(lavado, planchado));

        mockMvc.perform(get("/api/servicios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idServicio").value(1))
                .andExpect(jsonPath("$[0].tipoServicio").value("Lavado"))
                .andExpect(jsonPath("$[0].precio").value(3000))
                .andExpect(jsonPath("$[1].idServicio").value(2))
                .andExpect(jsonPath("$[1].tipoServicio").value("Planchado"))
                .andExpect(jsonPath("$[1].precio").value(2500));

        verify(servicioService).listarServicios();
    }

    @Test
    void deberiaObtenerServicioPorIdYRetornarStatus200() throws Exception {
        ServicioResponse response = ServicioResponse.builder()
                .idServicio(1L)
                .tipoServicio("Lavado")
                .precio(new BigDecimal("3000"))
                .build();

        when(servicioService.obtenerServicioPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/api/servicios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idServicio").value(1))
                .andExpect(jsonPath("$.tipoServicio").value("Lavado"))
                .andExpect(jsonPath("$.precio").value(3000));

        verify(servicioService).obtenerServicioPorId(1L);
    }

    @Test
    void deberiaActualizarServicioYRetornarStatus200() throws Exception {
        ActualizarServicioRequest request = new ActualizarServicioRequest();
        request.setTipoServicio("Lavado y planchado");
        request.setPrecio(new BigDecimal("5000"));

        ServicioResponse response = ServicioResponse.builder()
                .idServicio(1L)
                .tipoServicio("Lavado y planchado")
                .precio(new BigDecimal("5000"))
                .build();

        when(servicioService.actualizarServicio(eq(1L), any(ActualizarServicioRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/servicios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idServicio").value(1))
                .andExpect(jsonPath("$.tipoServicio").value("Lavado y planchado"))
                .andExpect(jsonPath("$.precio").value(5000));

        verify(servicioService).actualizarServicio(eq(1L), any(ActualizarServicioRequest.class));
    }

    @Test
    void deberiaEliminarServicioYRetornarStatus204() throws Exception {
        doNothing().when(servicioService).eliminarServicio(1L);

        mockMvc.perform(delete("/api/servicios/1"))
                .andExpect(status().isNoContent());

        verify(servicioService).eliminarServicio(1L);
    }

    @Test
    void deberiaRetornarStatus400SiCrearServicioNoTieneTipoServicio() throws Exception {
        CrearServicioRequest request = new CrearServicioRequest();
        request.setTipoServicio("");
        request.setPrecio(new BigDecimal("3000"));

        mockMvc.perform(post("/api/servicios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deberiaRetornarStatus400SiCrearServicioTienePrecioNegativo() throws Exception {
        CrearServicioRequest request = new CrearServicioRequest();
        request.setTipoServicio("Lavado");
        request.setPrecio(new BigDecimal("-1000"));

        mockMvc.perform(post("/api/servicios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deberiaRetornarStatus400SiActualizarServicioNoTienePrecio() throws Exception {
        ActualizarServicioRequest request = new ActualizarServicioRequest();
        request.setTipoServicio("Lavado");
        request.setPrecio(null);

        mockMvc.perform(put("/api/servicios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}