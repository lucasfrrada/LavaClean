package lavaclean.mcsv_inventario.infraestructure.persistance.repository;

import lavaclean.mcsv_inventario.infraestructure.persistance.entity.DetalleCompraInventarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleCompraInventarioRepository extends JpaRepository<DetalleCompraInventarioEntity, Long> {
}
