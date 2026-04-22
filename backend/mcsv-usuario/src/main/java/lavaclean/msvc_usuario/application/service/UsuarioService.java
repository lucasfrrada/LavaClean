package lavaclean.msvc_usuario.application.service;

import lavaclean.msvc_usuario.infrastructure.persistence.entity.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    Usuario findById(Long id);
    List<Usuario> findAll();
    void deleteById(Long id);
    Usuario save(Usuario usuario);
    Usuario update(Long id, Usuario usuario);

    // ==========================================
    // Métodos Críticos para Seguridad y JWT
    // ==========================================

    // Esencial para el Login: Busca al usuario (y su rol EAGER) por email
    Optional<Usuario> findByCorreo(String correo);

    // Metodo seguro para cambiar exclusivamente el rol sin tocar otros datos
    Usuario asignarRol(Long idUsuario, Integer idRol);
}
