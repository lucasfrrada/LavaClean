package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import mcsv.pedidos.api.dto.request.Prenda.ActualizarPrendaRequest;
import mcsv.pedidos.api.dto.request.Prenda.CrearPrendaRequest;
import mcsv.pedidos.api.dto.response.Prenda.PrendaResponse;
import mcsv.pedidos.infraestructure.persistence.entity.PrendaEntity;
import mcsv.pedidos.infraestructure.persistence.repository.PrendaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrendaServiceTest {

    @Mock
    private PrendaRepository prendaRepository;

    @InjectMocks
    private PrendaService prendaService;

    private PrendaEntity prenda;

    @BeforeEach
    void setUp() {
        prenda = PrendaEntity.builder()
                .idPrenda(1L)
                .nombrePrenda("Camisa")
                .categoria("Ropa")
                .build();
    }

    @Test
    void deberiaCrearPrendaCorrectamente() {
        CrearPrendaRequest request = new CrearPrendaRequest();
        request.setNombrePrenda("Camisa");
        request.setCategoria("Ropa");

        when(prendaRepository.existsByNombrePrenda("Camisa")).thenReturn(false);

        when(prendaRepository.save(any(PrendaEntity.class))).thenAnswer(invocation -> {
            PrendaEntity prendaGuardada = invocation.getArgument(0);
            prendaGuardada.setIdPrenda(1L);
            return prendaGuardada;
        });

        PrendaResponse response = prendaService.crearPrenda(request);

        assertThat(response).isNotNull();
        assertThat(response.getIdPrenda()).isEqualTo(1L);
        assertThat(response.getNombrePrenda()).isEqualTo("Camisa");
        assertThat(response.getCategoria()).isEqualTo("Ropa");

        ArgumentCaptor<PrendaEntity> prendaCaptor = ArgumentCaptor.forClass(PrendaEntity.class);
        verify(prendaRepository).save(prendaCaptor.capture());

        PrendaEntity prendaGuardada = prendaCaptor.getValue();

        assertThat(prendaGuardada.getNombrePrenda()).isEqualTo("Camisa");
        assertThat(prendaGuardada.getCategoria()).isEqualTo("Ropa");
    }

    @Test
    void noDeberiaCrearPrendaSiYaExisteNombre() {
        CrearPrendaRequest request = new CrearPrendaRequest();
        request.setNombrePrenda("Camisa");
        request.setCategoria("Ropa");

        when(prendaRepository.existsByNombrePrenda("Camisa")).thenReturn(true);

        assertThatThrownBy(() -> prendaService.crearPrenda(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ya existe una prenda con ese nombre");

        verify(prendaRepository, never()).save(any());
    }

    @Test
    void deberiaListarPrendas() {
        PrendaEntity pantalon = PrendaEntity.builder()
                .idPrenda(2L)
                .nombrePrenda("Pantalón")
                .categoria("Ropa")
                .build();

        when(prendaRepository.findAll()).thenReturn(List.of(prenda, pantalon));

        List<PrendaResponse> response = prendaService.listarPrendas();

        assertThat(response).hasSize(2);

        assertThat(response.get(0).getIdPrenda()).isEqualTo(1L);
        assertThat(response.get(0).getNombrePrenda()).isEqualTo("Camisa");
        assertThat(response.get(0).getCategoria()).isEqualTo("Ropa");

        assertThat(response.get(1).getIdPrenda()).isEqualTo(2L);
        assertThat(response.get(1).getNombrePrenda()).isEqualTo("Pantalón");
        assertThat(response.get(1).getCategoria()).isEqualTo("Ropa");

        verify(prendaRepository).findAll();
    }

    @Test
    void deberiaObtenerPrendaPorId() {
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));

        PrendaResponse response = prendaService.obtenerPrendaPorId(1L);

        assertThat(response).isNotNull();
        assertThat(response.getIdPrenda()).isEqualTo(1L);
        assertThat(response.getNombrePrenda()).isEqualTo("Camisa");
        assertThat(response.getCategoria()).isEqualTo("Ropa");

        verify(prendaRepository).findById(1L);
    }

    @Test
    void deberiaLanzarErrorSiPrendaNoExisteAlBuscarPorId() {
        when(prendaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prendaService.obtenerPrendaPorId(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Prenda no encontrada con id: 99");

        verify(prendaRepository).findById(99L);
    }

    @Test
    void deberiaActualizarPrendaCorrectamente() {
        ActualizarPrendaRequest request = new ActualizarPrendaRequest();
        request.setNombrePrenda("Chaqueta");
        request.setCategoria("Abrigo");

        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));
        when(prendaRepository.save(any(PrendaEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PrendaResponse response = prendaService.actualizarPrenda(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getIdPrenda()).isEqualTo(1L);
        assertThat(response.getNombrePrenda()).isEqualTo("Chaqueta");
        assertThat(response.getCategoria()).isEqualTo("Abrigo");

        assertThat(prenda.getNombrePrenda()).isEqualTo("Chaqueta");
        assertThat(prenda.getCategoria()).isEqualTo("Abrigo");

        verify(prendaRepository).findById(1L);
        verify(prendaRepository).save(prenda);
    }

    @Test
    void deberiaLanzarErrorSiPrendaNoExisteAlActualizar() {
        ActualizarPrendaRequest request = new ActualizarPrendaRequest();
        request.setNombrePrenda("Chaqueta");
        request.setCategoria("Abrigo");

        when(prendaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prendaService.actualizarPrenda(99L, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Prenda no encontrada con id: 99");

        verify(prendaRepository).findById(99L);
        verify(prendaRepository, never()).save(any());
    }

    @Test
    void deberiaEliminarPrendaCorrectamente() {
        when(prendaRepository.findById(1L)).thenReturn(Optional.of(prenda));

        prendaService.eliminarPrenda(1L);

        verify(prendaRepository).findById(1L);
        verify(prendaRepository).delete(prenda);
    }

    @Test
    void deberiaLanzarErrorSiPrendaNoExisteAlEliminar() {
        when(prendaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prendaService.eliminarPrenda(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Prenda no encontrada con id: 99");

        verify(prendaRepository).findById(99L);
        verify(prendaRepository, never()).delete(any());
    }
}