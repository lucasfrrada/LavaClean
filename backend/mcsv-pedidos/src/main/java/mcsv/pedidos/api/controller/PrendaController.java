package mcsv.pedidos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.Prenda.ActualizarPrendaRequest;
import mcsv.pedidos.api.dto.request.Prenda.CrearPrendaRequest;
import mcsv.pedidos.api.dto.response.Prenda.PrendaResponse;
import mcsv.pedidos.application.service.PrendaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prendas")
@RequiredArgsConstructor
public class PrendaController {

    private final PrendaService prendaService;

    @PostMapping
    public ResponseEntity<PrendaResponse> crearPrenda(@Valid @RequestBody CrearPrendaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prendaService.crearPrenda(request));
    }

    @GetMapping
    public ResponseEntity<?> listarPrendas() {
        return ResponseEntity.ok(prendaService.listarPrendas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrendaResponse> obtenerPrendaPorId(@PathVariable Long id) {
        return ResponseEntity.ok(prendaService.obtenerPrendaPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrendaResponse> actualizarPrenda(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPrendaRequest request
    ) {
        return ResponseEntity.ok(prendaService.actualizarPrenda(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPrenda(@PathVariable Long id) {
        prendaService.eliminarPrenda(id);
        return ResponseEntity.noContent().build();
    }
}