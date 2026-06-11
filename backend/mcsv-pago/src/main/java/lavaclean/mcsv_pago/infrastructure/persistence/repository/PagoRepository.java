package lavaclean.mcsv_pago.infrastructure.persistence.repository;

import lavaclean.mcsv_pago.infrastructure.persistence.entity.PagoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<PagoEntity, Long> {
    Optional<PagoEntity> findByIdPedido(String idPedido);
}