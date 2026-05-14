package lavaclean.mcsv_inventario.api.controller;

import jakarta.validation.Valid;
import lavaclean.mcsv_inventario.api.dto.request.producto.ActualizarProductoRequest;
import lavaclean.mcsv_inventario.api.dto.request.producto.CrearProductoRequest;
import lavaclean.mcsv_inventario.api.dto.response.producto.ProductoResponse;
import lavaclean.mcsv_inventario.application.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    //GUARDAR PRODUCTO
    @PostMapping
    public ResponseEntity<ProductoResponse> save(@Valid @RequestBody CrearProductoRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.save(request));
    }

    //OBTENER PRODUCTOS ACTIVOS
    @GetMapping
    public ResponseEntity<List<ProductoResponse>> findAll(){
        return ResponseEntity.status(HttpStatus.OK).body(productoService.findAll());
    }

    //OBTENER POR ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> findById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK).body(productoService.findById(id));
    }

    //EDITAR POR ID
    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> update(@PathVariable Long id, @Valid @RequestBody ActualizarProductoRequest request){
        return ResponseEntity.ok(productoService.updateProduct(id, request));
    }

    //BORRAR POR ID
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductoResponse> delete(@PathVariable Long id){
        productoService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
