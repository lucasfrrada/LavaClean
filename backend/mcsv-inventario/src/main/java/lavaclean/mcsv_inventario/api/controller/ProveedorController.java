package lavaclean.mcsv_inventario.api.controller;

import jakarta.validation.Valid;
import lavaclean.mcsv_inventario.api.dto.request.proveedor.ActualizarProveedorRequest;
import lavaclean.mcsv_inventario.api.dto.request.proveedor.CrearProveedorRequest;
import lavaclean.mcsv_inventario.api.dto.response.proveedor.ProveedorResponse;
import lavaclean.mcsv_inventario.application.service.ProveedorService;
import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProveedorEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    //GUARDAR PROVEEDOR
    @PostMapping
    public ResponseEntity<ProveedorResponse> save(@Valid @RequestBody CrearProveedorRequest proveedor){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proveedorService.save(proveedor));
    }

    //LISTAR TODOS LOS PROVEEDORES
    @GetMapping
    public ResponseEntity<List<ProveedorResponse>> findAll(){
        return  ResponseEntity.ok(proveedorService.listAll());
    }

    //LISTAR PROVEEDOR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponse> findById(@PathVariable Long id){
        return ResponseEntity.ok(proveedorService.findById(id));
    }

    //EDITAR POR ID
    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponse> update(@PathVariable Long id, @Valid @RequestBody ActualizarProveedorRequest proveedor){
        return ResponseEntity.ok(proveedorService.update(id, proveedor));
    }

    //ELIMINAR POR ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        proveedorService.delete(id);
        return ResponseEntity.noContent().build();
    }



}
