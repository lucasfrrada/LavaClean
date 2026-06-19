package mcsv.mcsv_notificacion.application.service;

import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;

import java.util.List;

public interface NotificacionService {

    // 1. Caso de uso principal: Crear y procesar el envío de un mensaje
    NotificacionResponse crearYEnviarNotificacion(NotificacionRequest request);

    // 2. Consultar la bandeja de entrada de un usuario
    List<NotificacionResponse> obtenerNotificacionesPorUsuario(Long idUsuario);

    // 3. Trazabilidad de un pedido específico
    List<NotificacionResponse> obtenerNotificacionesPorPedido(Long idPedido);

    // 4. Proceso de contingencia: Reintentar envíos que fallaron
    void reintentarNotificacionesFallidas();
}