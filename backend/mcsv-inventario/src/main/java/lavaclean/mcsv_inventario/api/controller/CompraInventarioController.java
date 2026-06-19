package lavaclean.mcsv_inventario.api.controller;

import jakarta.validation.Valid;
import lavaclean.mcsv_inventario.api.dto.request.compraInventario.CrearCompraInventarioRequest;
import lavaclean.mcsv_inventario.api.dto.request.detalleCompra.ActualizarDetalleCompraRequest;
import lavaclean.mcsv_inventario.api.dto.request.detalleCompra.CrearDetalleCompraRequest;
import lavaclean.mcsv_inventario.api.dto.response.compraInventario.CompraInventarioResponse;
import lavaclean.mcsv_inventario.application.service.CompraInventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras-inventario")
@RequiredArgsConstructor
public class CompraInventarioController {

    private final CompraInventarioService compraInventarioService;

    //GUARDAR COMPRA
    @PostMapping
    public ResponseEntity<CompraInventarioResponse> registrarCompra(@Valid @RequestBody CrearCompraInventarioRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(compraInventarioService.registrarCompra(request));
    }

    //LISTAR TODAS LAS COMPRAS
    @GetMapping
    public ResponseEntity<List<CompraInventarioResponse>> listarCompras(){
        return ResponseEntity.status(HttpStatus.OK).body(compraInventarioService.listarCompras());
    }

    //LISTAR COMPRA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<CompraInventarioResponse> obtenerCompraPorId(@PathVariable("id") Long id){
        return ResponseEntity.ok(compraInventarioService.obtenerCompraPorId(id));
    }

    //CANCELAR COMPRA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarCompra(@PathVariable("id") Long id){
        compraInventarioService.cancelarCompra(id);
        return ResponseEntity.noContent().build();
    }


    //EDITAR DETALLE COMPRA POR ID
    @PatchMapping("/{id}/detalles")
    public ResponseEntity<CompraInventarioResponse> actualizarDetallesCompra(@PathVariable Long id, @Valid @RequestBody ActualizarDetalleCompraRequest request){
        return ResponseEntity.ok(compraInventarioService.actualizarDetalleCompra(id, request));
    }

}
