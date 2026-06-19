package mcsv.pedidos.infraestructure.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PedidoEventProducer {

    private final KafkaTemplate<String, PedidoEstadoCambiadoEvent> kafkaTemplate;

    @Value("${app.kafka.topic.pedido-estado}")
    private String topic;

    public void publicarCambioEstado(PedidoEstadoCambiadoEvent evento) {
        kafkaTemplate.send(
                topic,
                evento.idPedido().toString(),
                evento
        ).whenComplete((resultado, error) -> {
            if (error != null) {
                log.error("No se pudo publicar el evento del pedido {}",
                        evento.idPedido(), error);
            } else {
                log.info("Evento publicado para pedido {}: {}",
                        evento.idPedido(), evento.estado());
            }
        });
    }
}