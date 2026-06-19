package mcsv.pedidos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Servicio.ActualizarServicioRequest;
import mcsv.pedidos.api.dto.request.Servicio.CrearServicioRequest;
import mcsv.pedidos.api.dto.response.Servicio.ServicioResponse;
import mcsv.pedidos.application.service.ServicioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioService servicioService;

    @PostMapping
    public ResponseEntity<ServicioResponse> crearServicio(@Valid @RequestBody CrearServicioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicioService.crearServicio(request));
    }

    @GetMapping
    public ResponseEntity<?> listarServicios() {
        return ResponseEntity.ok(servicioService.listarServicios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicioResponse> obtenerServicioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.obtenerServicioPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicioResponse> actualizarServicio(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarServicioRequest request
    ) {
        return ResponseEntity.ok(servicioService.actualizarServicio(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarServicio(@PathVariable Long id) {
        servicioService.eliminarServicio(id);
        return ResponseEntity.noContent().build();
    }
}