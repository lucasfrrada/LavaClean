package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {
    boolean existsByNombreProducto(String nombreProducto);
    List<ProductoEntity> findByEstado(String estado);
}
