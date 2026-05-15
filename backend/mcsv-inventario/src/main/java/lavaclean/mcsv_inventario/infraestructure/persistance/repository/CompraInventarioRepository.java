package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.CompraInventarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompraInventarioRepository extends JpaRepository<CompraInventarioEntity, Long> {

}
