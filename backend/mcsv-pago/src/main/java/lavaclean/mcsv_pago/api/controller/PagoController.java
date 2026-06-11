package lavaclean.mcsv_pago.api.controller;

import lavaclean.mcsv_pago.api.dto.PagoRequest;
import lavaclean.mcsv_pago.api.dto.PagoResponse;
import lavaclean.mcsv_pago.application.service.PagoService;
import lavaclean.mcsv_pago.infrastructure.persistence.entity.PagoEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping("/procesar")
    public ResponseEntity<PagoResponse> procesarPago(@RequestBody PagoRequest request) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.procesarPagoPedido(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.buscarPorId(id));
    }

    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<PagoEntity> obtenerPorIdPedido(@PathVariable String idPedido) {
        return ResponseEntity.ok(pagoService.buscarPorIdPedido(idPedido));
    }

    @GetMapping
    public ResponseEntity<List<PagoEntity>> listarTodos() {
        return ResponseEntity.ok(pagoService.listarTodos());
    }

    @PutMapping("/estado/{idPedido}")
    public ResponseEntity<PagoEntity> actualizarEstado(@PathVariable String idPedido, @RequestParam String estado) {
        return ResponseEntity.ok(pagoService.actualizarEstadoPago(idPedido, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoService.eliminarPago(id);
        return ResponseEntity.noContent().build();
    }
}
