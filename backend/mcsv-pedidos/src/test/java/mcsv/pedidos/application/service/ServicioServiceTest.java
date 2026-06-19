package mcsv.pedidos.application.service;

import jakarta.persistence.EntityNotFoundException;
import mcsv.pedidos.api.dto.request.Servicio.ActualizarServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.CrearServicioRequest;
import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.infraestructure.persistence.entity.ServicioEntity;
import mcsv.pedidos.infraestructure.persistence.repository.ServicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicioServiceTest {

    @Mock
    private ServicioRepository servicioRepository;

    @InjectMocks
    private ServicioService servicioService;

    private ServicioEntity servicio;

    @BeforeEach
    void setUp() {
        servicio = ServicioEntity.builder()
                .idServicio(1L)
                .tipoServicio("Lavado")
                .precio(new BigDecimal("3000"))
                .build();
    }

    @Test
    void deberiaCrearServicioCorrectamente() {
        CrearServicioRequest request = new CrearServicioRequest();
        request.setTipoServicio("Lavado");
        request.setPrecio(new BigDecimal("3000"));

        when(servicioRepository.existsByTipoServicio("Lavado")).thenReturn(false);

        when(servicioRepository.save(any(ServicioEntity.class))).thenAnswer(invocation -> {
            ServicioEntity servicioGuardado = invocation.getArgument(0);
            servicioGuardado.setIdServicio(1L);
            return servicioGuardado;
        });

        ServicioResponse response = servicioService.crearServicio(request);

        assertThat(response).isNotNull();
        assertThat(response.getIdServicio()).isEqualTo(1L);
        assertThat(response.getTipoServicio()).isEqualTo("Lavado");
        assertThat(response.getPrecio()).isEqualByComparingTo("3000");

        ArgumentCaptor<ServicioEntity> servicioCaptor = ArgumentCaptor.forClass(ServicioEntity.class);
        verify(servicioRepository).save(servicioCaptor.capture());

        ServicioEntity servicioGuardado = servicioCaptor.getValue();

        assertThat(servicioGuardado.getTipoServicio()).isEqualTo("Lavado");
        assertThat(servicioGuardado.getPrecio()).isEqualByComparingTo("3000");
    }

    @Test
    void noDeberiaCrearServicioSiYaExisteTipoServicio() {
        CrearServicioRequest request = new CrearServicioRequest();
        request.setTipoServicio("Lavado");
        request.setPrecio(new BigDecimal("3000"));

        when(servicioRepository.existsByTipoServicio("Lavado")).thenReturn(true);

        assertThatThrownBy(() -> servicioService.crearServicio(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ya existe un servicio con ese nombre");

        verify(servicioRepository, never()).save(any());
    }

    @Test
    void deberiaListarServicios() {
        ServicioEntity planchado = ServicioEntity.builder()
                .idServicio(2L)
                .tipoServicio("Planchado")
                .precio(new BigDecimal("2500"))
                .build();

        when(servicioRepository.findAll()).thenReturn(List.of(servicio, planchado));

        List<ServicioResponse> response = servicioService.listarServicios();

        assertThat(response).hasSize(2);

        assertThat(response.get(0).getIdServicio()).isEqualTo(1L);
        assertThat(response.get(0).getTipoServicio()).isEqualTo("Lavado");
        assertThat(response.get(0).getPrecio()).isEqualByComparingTo("3000");

        assertThat(response.get(1).getIdServicio()).isEqualTo(2L);
        assertThat(response.get(1).getTipoServicio()).isEqualTo("Planchado");
        assertThat(response.get(1).getPrecio()).isEqualByComparingTo("2500");

        verify(servicioRepository).findAll();
    }

    @Test
    void deberiaObtenerServicioPorId() {
        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));

        ServicioResponse response = servicioService.obtenerServicioPorId(1L);

        assertThat(response).isNotNull();
        assertThat(response.getIdServicio()).isEqualTo(1L);
        assertThat(response.getTipoServicio()).isEqualTo("Lavado");
        assertThat(response.getPrecio()).isEqualByComparingTo("3000");

        verify(servicioRepository).findById(1L);
    }

    @Test
    void deberiaLanzarErrorSiServicioNoExisteAlBuscarPorId() {
        when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicioService.obtenerServicioPorId(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Servicio no encontrado con id: 99");

        verify(servicioRepository).findById(99L);
    }

    @Test
    void deberiaActualizarServicioCorrectamente() {
        ActualizarServicioRequest request = new ActualizarServicioRequest();
        request.setTipoServicio("Lavado y planchado");
        request.setPrecio(new BigDecimal("5000"));

        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));
        when(servicioRepository.save(any(ServicioEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ServicioResponse response = servicioService.actualizarServicio(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getIdServicio()).isEqualTo(1L);
        assertThat(response.getTipoServicio()).isEqualTo("Lavado y planchado");
        assertThat(response.getPrecio()).isEqualByComparingTo("5000");

        assertThat(servicio.getTipoServicio()).isEqualTo("Lavado y planchado");
        assertThat(servicio.getPrecio()).isEqualByComparingTo("5000");

        verify(servicioRepository).findById(1L);
        verify(servicioRepository).save(servicio);
    }

    @Test
    void deberiaLanzarErrorSiServicioNoExisteAlActualizar() {
        ActualizarServicioRequest request = new ActualizarServicioRequest();
        request.setTipoServicio("Lavado y planchado");
        request.setPrecio(new BigDecimal("5000"));

        when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicioService.actualizarServicio(99L, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Servicio no encontrado con id: 99");

        verify(servicioRepository).findById(99L);
        verify(servicioRepository, never()).save(any());
    }

    @Test
    void deberiaEliminarServicioCorrectamente() {
        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));

        servicioService.eliminarServicio(1L);

        verify(servicioRepository).findById(1L);
        verify(servicioRepository).delete(servicio);
    }

    @Test
    void deberiaLanzarErrorSiServicioNoExisteAlEliminar() {
        when(servicioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicioService.eliminarServicio(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Servicio no encontrado con id: 99");

        verify(servicioRepository).findById(99L);
        verify(servicioRepository, never()).delete(any());
    }
}