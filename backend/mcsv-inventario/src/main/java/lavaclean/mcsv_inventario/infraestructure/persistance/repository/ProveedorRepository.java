package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProveedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProveedorRepository extends JpaRepository<ProveedorEntity,Long> {

    boolean existsByCorreo(String correo);

}
