package mcsv.pedidos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.request.ActualizarEstadoPedidoRequest;
import mcsv.pedidos.api.dto.request.ActualizarPedidoRequest;
import mcsv.pedidos.api.dto.request.CrearPedidoRequest;
import mcsv.pedidos.api.dto.response.PedidoResponse;
import mcsv.pedidos.application.service.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    //GUARDAR PEDIDO
    @PostMapping
    public ResponseEntity<PedidoResponse> createPedido(@Valid @RequestBody CrearPedidoRequest crearPedidoRequest){

        PedidoResponse pedido = pedidoService.save(crearPedidoRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);

    }

    //LISTAR TODOS LOS PEDIDOS
    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listarPedidos() {
        return ResponseEntity.ok(pedidoService.listarPedidos());
    }

    //PEDIDO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.findById(id));
    }

//    @GetMapping("/usuario/{IdUsuario}")
//    public ResponseEntity<List<PedidoResponse>> findByUserId(@PathVariable Long usuarioId) {
//        return ResponseEntity.ok(pedidoService.findByUserId(usuarioId));
//    }

    //ACTUALIZAR PEDIDO
    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponse> actualizarPedido(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarPedido(id, request));
    }

    //ACTUALIZAR ESTADO PEDIDO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, request));
    }

    //ELIMINAR PEDIDO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        pedidoService.eliminarPedido(id);
        return ResponseEntity.noContent().build();
    }
}
