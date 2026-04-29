package lavaclean.msvc_usuario.infrastructure.persistence.repository;

import lavaclean.msvc_usuario.infrastructure.persistence.entity.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Opcional

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<RolEntity, Long> {
    Optional<RolEntity> findByNombreRol(String nombreRol);
}