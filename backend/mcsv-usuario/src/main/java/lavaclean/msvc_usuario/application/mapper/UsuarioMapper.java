package lavaclean.msvc_usuario.application.mapper;


import lavaclean.msvc_usuario.api.dto.UsuarioRequest;
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;

public class UsuarioMapper {

    public static UsuarioResponse toResponse(UsuarioEntity usuarioEntity) {
        if (usuarioEntity == null) {
            return null;
        }
        String nombreCompleto = usuarioEntity.getNombres() + " " + usuarioEntity.getApPaterno();
        if (usuarioEntity.getApMaterno() != null && !usuarioEntity.getApMaterno().trim().isEmpty()) {
            nombreCompleto += " " + usuarioEntity.getApMaterno();
        }

        return UsuarioResponse.builder()
                .idUsuario(usuarioEntity.getIdUsuario())
                .nombreCompleto(nombreCompleto)
                .correo(usuarioEntity.getCorreo())
                .telefono(usuarioEntity.getTelefono())
                .idRol(usuarioEntity.getIdRolEntity() != null ? usuarioEntity.getIdRolEntity().getIdRol() : null)
                .build();
    }

    public static UsuarioEntity toEntity(UsuarioRequest request) {
        if (request == null) {
            return null;
        }

        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setNombres(request.getNombres());
        usuario.setApPaterno(request.getApPaterno());
        usuario.setApMaterno(request.getApMaterno());
        usuario.setCorreo(request.getCorreo());
        usuario.setTelefono(request.getTelefono());

        return usuario;
    }
}
