package lavaclean.msvc_usuario.infrastructure.persistence.repository;

import lavaclean.msvc_usuario.infrastructure.persistence.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Optional<Usuario> findByCorreo(String correo);

}
