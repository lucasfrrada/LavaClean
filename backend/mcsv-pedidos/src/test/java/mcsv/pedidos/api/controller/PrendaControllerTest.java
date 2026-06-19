package mcsv.pedidos.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mcsv.pedidos.api.dto.request.Prenda.ActualizarPrendaRequest;
import mcsv.pedidos.api.dto.request.Prenda.CrearPrendaRequest;
import mcsv.pedidos.api.dto.response.Prenda.PrendaResponse;
import mcsv.pedidos.application.service.PrendaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

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
class PrendaControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private PrendaService prendaService;

    @BeforeEach
    void setUp() {
        PrendaController prendaController = new PrendaController(prendaService);

        mockMvc = MockMvcBuilders
                .standaloneSetup(prendaController)
                .build();

        objectMapper = new ObjectMapper();
    }

    @Test
    void deberiaCrearPrendaYRetornarStatus201() throws Exception {
        CrearPrendaRequest request = new CrearPrendaRequest();
        request.setNombrePrenda("Camisa");
        request.setCategoria("Ropa");

        PrendaResponse response = PrendaResponse.builder()
                .idPrenda(1L)
                .nombrePrenda("Camisa")
                .categoria("Ropa")
                .build();

        when(prendaService.crearPrenda(any(CrearPrendaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/prendas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPrenda").value(1))
                .andExpect(jsonPath("$.nombrePrenda").value("Camisa"))
                .andExpect(jsonPath("$.categoria").value("Ropa"));

        verify(prendaService).crearPrenda(any(CrearPrendaRequest.class));
    }

    @Test
    void deberiaListarPrendasYRetornarStatus200() throws Exception {
        PrendaResponse camisa = PrendaResponse.builder()
                .idPrenda(1L)
                .nombrePrenda("Camisa")
                .categoria("Ropa")
                .build();

        PrendaResponse chaqueta = PrendaResponse.builder()
                .idPrenda(2L)
                .nombrePrenda("Chaqueta")
                .categoria("Abrigo")
                .build();

        when(prendaService.listarPrendas()).thenReturn(List.of(camisa, chaqueta));

        mockMvc.perform(get("/api/prendas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idPrenda").value(1))
                .andExpect(jsonPath("$[0].nombrePrenda").value("Camisa"))
                .andExpect(jsonPath("$[0].categoria").value("Ropa"))
                .andExpect(jsonPath("$[1].idPrenda").value(2))
                .andExpect(jsonPath("$[1].nombrePrenda").value("Chaqueta"))
                .andExpect(jsonPath("$[1].categoria").value("Abrigo"));

        verify(prendaService).listarPrendas();
    }

    @Test
    void deberiaObtenerPrendaPorIdYRetornarStatus200() throws Exception {
        PrendaResponse response = PrendaResponse.builder()
                .idPrenda(1L)
                .nombrePrenda("Camisa")
                .categoria("Ropa")
                .build();

        when(prendaService.obtenerPrendaPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/api/prendas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPrenda").value(1))
                .andExpect(jsonPath("$.nombrePrenda").value("Camisa"))
                .andExpect(jsonPath("$.categoria").value("Ropa"));

        verify(prendaService).obtenerPrendaPorId(1L);
    }

    @Test
    void deberiaActualizarPrendaYRetornarStatus200() throws Exception {
        ActualizarPrendaRequest request = new ActualizarPrendaRequest();
        request.setNombrePrenda("Chaqueta");
        request.setCategoria("Abrigo");

        PrendaResponse response = PrendaResponse.builder()
                .idPrenda(1L)
                .nombrePrenda("Chaqueta")
                .categoria("Abrigo")
                .build();

        when(prendaService.actualizarPrenda(eq(1L), any(ActualizarPrendaRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/prendas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPrenda").value(1))
                .andExpect(jsonPath("$.nombrePrenda").value("Chaqueta"))
                .andExpect(jsonPath("$.categoria").value("Abrigo"));

        verify(prendaService).actualizarPrenda(eq(1L), any(ActualizarPrendaRequest.class));
    }

    @Test
    void deberiaEliminarPrendaYRetornarStatus204() throws Exception {
        doNothing().when(prendaService).eliminarPrenda(1L);

        mockMvc.perform(delete("/api/prendas/1"))
                .andExpect(status().isNoContent());

        verify(prendaService).eliminarPrenda(1L);
    }

    @Test
    void deberiaRetornarStatus400SiCrearPrendaNoTieneNombre() throws Exception {
        CrearPrendaRequest request = new CrearPrendaRequest();
        request.setNombrePrenda("");
        request.setCategoria("Ropa");

        mockMvc.perform(post("/api/prendas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deberiaRetornarStatus400SiActualizarPrendaNoTieneCategoria() throws Exception {
        ActualizarPrendaRequest request = new ActualizarPrendaRequest();
        request.setNombrePrenda("Camisa");
        request.setCategoria("");

        mockMvc.perform(put("/api/prendas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}