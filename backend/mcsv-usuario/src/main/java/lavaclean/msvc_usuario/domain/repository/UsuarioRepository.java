package lavaclean.msvc_usuario.repository;

import lavaclean.msvc_usuario.domain.model.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    List<Usuario> findByIdUsuario(Long idUsuario);

}
