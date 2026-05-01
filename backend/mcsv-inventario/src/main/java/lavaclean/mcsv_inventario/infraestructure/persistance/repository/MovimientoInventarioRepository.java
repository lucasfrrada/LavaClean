package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.MovimientoInventarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventarioEntity, Long> {

    List<MovimientoInventarioEntity> findByProductoIdProducto(Long idProducto);

}
