package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {
}
