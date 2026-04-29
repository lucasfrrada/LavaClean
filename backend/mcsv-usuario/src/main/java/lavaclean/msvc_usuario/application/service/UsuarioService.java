package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.api.dto.UsuarioRequest; // <-- Importación necesaria
import lavaclean.msvc_usuario.api.dto.UsuarioResponse;
import lavaclean.msvc_usuario.infrastructure.persistence.entity.UsuarioEntity;

import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    UsuarioEntity findById(Long id);
    List<UsuarioResponse> findAll();
    void deleteById(Long id);
    UsuarioEntity registrarUsuario(UsuarioRequest request);
    UsuarioEntity update(Long id, UsuarioEntity usuarioEntity);
    // Métodos Críticos para Seguridad y JWT
    // Esencial para el Login: Busca al usuario (y su rol EAGER) por email
    Optional<UsuarioEntity> findByCorreo(String correo);
    // Metodo seguro para cambiar exclusivamente el rol sin tocar otros datos
    UsuarioEntity asignarRol(Long idUsuario, Long idRol);
}