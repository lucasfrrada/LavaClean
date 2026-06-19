package mcsv.mcsv_notificacion.infrastructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.application.service.NotificacionService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PedidoEstadoConsumer {

    private final NotificacionService notificacionService;

    @KafkaListener(topics = "${app.kafka.topic.pedido-estado}")
    public void consumir(PedidoEstadoCambiadoEvent evento) {
        log.info("Evento recibido: pedido {} cambió a {}",
                evento.idPedido(), evento.estado());

        NotificacionRequest request = new NotificacionRequest();
        request.setIdPedido(evento.idPedido());
        request.setIdUsuario(evento.idUsuario());
        request.setTipoNotificacion(evento.tipoNotificacion());
        request.setMensaje(evento.mensaje());

        notificacionService.crearYEnviarNotificacion(request);
    }
}