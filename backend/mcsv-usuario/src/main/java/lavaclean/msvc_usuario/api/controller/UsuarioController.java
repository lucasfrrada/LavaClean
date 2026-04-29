package lavaclean.msvc_usuario.api.controller;

import jakarta.validation.Valid;
import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.mapper.UsuarioMapper;
import lavaclean.msvc_usuario.application.service.UsuarioService;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Listar todos los Usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> ListarUsuarios(){
        return ResponseEntity.status(HttpStatus.OK).body(this.usuarioService.findAll());
    }

    // Guardar Usuario
    @PostMapping
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody UsuarioRequest request) {
        UsuarioEntity guardado = usuarioService.registrarUsuario(request);
        UsuarioResponse response = UsuarioMapper.toResponse(guardado);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Actualizar datos de perfil por ID
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        UsuarioEntity datosActualizar = UsuarioMapper.toEntity(request);
        UsuarioEntity actualizado = this.usuarioService.update(id, datosActualizar);
        return ResponseEntity.ok(UsuarioMapper.toResponse(actualizado));
    }

    // Eliminar Usuario por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        this.usuarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}