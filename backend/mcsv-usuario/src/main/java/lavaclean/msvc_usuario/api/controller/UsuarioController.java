package lavaclean.msvc_usuario.api.controller;

import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.application.service.UsuarioService;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> registrar(@RequestBody UsuarioRequest request) {
        // Convertimos Request -> Entity (En el futuro esto lo hace el Mapper)
        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setNombres(request.getNombres());
        usuario.setCorreo(request.getCorreo());
        // ... setear resto de campos ...

        UsuarioEntity guardado = usuarioService.save(usuario);

        // Convertimos Entity -> Response (Filtramos datos sensibles)
        UsuarioResponse response = UsuarioResponse.builder()
                .idUsuario(guardado.getIdUsuario())
                .idRol(guardado.getIdRolEntity().getIdRol())
                .nombreCompleto(guardado.getNombres() + " " + guardado.getApPaterno())
                .correo(guardado.getCorreo())
                .telefono(guardado.getTelefono())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}