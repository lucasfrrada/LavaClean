package lavaclean.msvc_usuario.domain.repository;

import lavaclean.msvc_usuario.domain.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    Optional<Usuario> findByCorreo(String correo);

}
