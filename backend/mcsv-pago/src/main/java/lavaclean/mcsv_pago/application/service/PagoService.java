package lavaclean.mcsv_pago.application.service;

import lavaclean.mcsv_pago.api.dto.PagoRequest;
import lavaclean.mcsv_pago.api.dto.PagoResponse;
import lavaclean.mcsv_pago.infrastructure.persistence.entity.PagoEntity;

import java.util.List;

public interface PagoService {
    // Metodo principal del flujo del MVP para gatillar el link de Mercado Pago
    PagoResponse procesarPagoPedido(PagoRequest request) throws Exception;
    // Métodos de control interno para la persistencia local de pago_db
    PagoEntity buscarPorId(Long id);
    PagoEntity buscarPorIdPedido(String idPedido);
    List<PagoEntity> listarTodos();
    // Este metodo lo usaremos más adelante cuando Mercado Pago nos avise que el usuario pagó
    PagoEntity actualizarEstadoPago(String idPedido, String nuevoEstado);
    void eliminarPago(Long id);
}