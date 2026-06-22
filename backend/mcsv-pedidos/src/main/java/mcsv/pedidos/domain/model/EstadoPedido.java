package mcsv.pedidos.domain.model;

public enum EstadoPedido {
    PENDIENTE_CONFIRMACION,
    PENDIENTE_PESAJE,
    LISTO_PARA_RETIRO,
    // Estados legados conservados para pedidos existentes.
    REVISION,
    CONFIRMADO,
    EN_PROCESO,
    COMPLETADO,
    ENTREGADO,
    CANCELADO,
    PAGADO
}
