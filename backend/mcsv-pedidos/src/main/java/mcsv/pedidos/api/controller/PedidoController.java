package mcsv.pedidos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mcsv.pedidos.api.dto.CrearPedidoRequest;
import mcsv.pedidos.api.dto.PedidoResponse;
import mcsv.pedidos.application.service.PedidoService;
import mcsv.pedidos.infraestructure.persistence.entity.PedidoEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> createPedido(@Valid @RequestBody CrearPedidoRequest crearPedidoRequest){

        PedidoResponse pedido = pedidoService.save(crearPedidoRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);

    }

}
