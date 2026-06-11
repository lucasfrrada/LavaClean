package lavaclean.mcsv_inventario.api.controller;

import jakarta.validation.Valid;

import lavaclean.mcsv_inventario.api.dto.request.movimientoInventario.CrearMovimientoInventarioRequest;
import lavaclean.mcsv_inventario.api.dto.response.movimientoInventario.MovimientoInventarioResponse;
import lavaclean.mcsv_inventario.application.service.MovimientoInventarioService;
import lavaclean.mcsv_inventario.domain.model.TipoMovimientoInventario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movimientos-inventario")
@RequiredArgsConstructor
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoInventarioService;

    //GUARDAR MOVIMIENTO
    @PostMapping
    public ResponseEntity<MovimientoInventarioResponse> registrarMovimientoManual(
            @Valid @RequestBody CrearMovimientoInventarioRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimientoInventarioService.registrarMovimiento(request));
    }

    //LISTAR TODOS LOS MOVIMIENTOS
    @GetMapping
    public ResponseEntity<?> listarMovimientos() {
        return ResponseEntity.ok(movimientoInventarioService.listAll());
    }

    //LISTAR MOVIMIENTO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<MovimientoInventarioResponse> obtenerMovimientoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoInventarioService.findById(id));
    }


    //LISTAR MOVIMIENTOS POR PRODUCTOS
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<?> listarMovimientosPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(movimientoInventarioService.listarMovimientosPorProducto(idProducto));
    }


    //LISTAR MOVIMIENTOS POR TIPO DE MOVIMIENTO
    @GetMapping("/tipo/{tipoMovimiento}")
    public ResponseEntity<?> listarMovimientosPorTipo(@PathVariable TipoMovimientoInventario tipoMovimiento) {
        return ResponseEntity.ok(movimientoInventarioService.listarMovimientosPorTipo(tipoMovimiento));
    }
}