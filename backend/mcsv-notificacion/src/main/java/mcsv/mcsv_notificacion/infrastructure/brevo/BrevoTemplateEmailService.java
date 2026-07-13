package mcsv.mcsv_notificacion.infrastructure.brevo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.mcsv_notificacion.infrastructure.brevo.dto.BrevoEmailRequest;
import mcsv.mcsv_notificacion.infrastructure.brevo.dto.BrevoRecipient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrevoTemplateEmailService {

    private final RestClient.Builder restClientBuilder;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.template.estado-pedido-id}")
    private Long templateEstadoPedidoId;

    public void enviarEstadoPedido(
            String correoDestino,
            String nombreCliente,
            Long idPedido,
            String estadoPedido,
            String mensaje
    ) {
        RestClient restClient = restClientBuilder
                .baseUrl("https://api.brevo.com/v3")
                .build();

        BrevoEmailRequest request = new BrevoEmailRequest(
                List.of(
                        new BrevoRecipient(
                                correoDestino,
                                nombreCliente
                        )
                ),
                templateEstadoPedidoId,
                Map.of(
                        "nombreCliente", nombreCliente != null ? nombreCliente : "cliente",
                        "idPedido", idPedido,
                        "estadoPedido", formatearEstadoPedido(estadoPedido),
                        "mensaje", mensaje,
                        "urlPedido", "http://localhost:5173/mis-pedidos"
                )
        );

        restClient.post()
                .uri("/smtp/email")
                .header("api-key", brevoApiKey)
                .header("Content-Type", "application/json")
                .body(request)
                .retrieve()
                .toBodilessEntity();

        log.info("Correo enviado con plantilla Brevo a {}", correoDestino);
    }

    private String formatearEstadoPedido(String estado) {
        if (estado == null) {
            return "Pedido actualizado";
        }

        if (estado.startsWith("ESTADO_PEDIDO_")) {
            estado = estado.replace("ESTADO_PEDIDO_", "");
        }

        return switch (estado) {
            case "REVISION" -> "En revisión";
            case "CONFIRMADO" -> "Confirmado";
            case "EN_PROCESO" -> "En proceso";
            case "COMPLETADO" -> "Completado";
            case "ENTREGADO" -> "Entregado";
            case "PAGADO" -> "Pagado";
            case "CANCELADO" -> "Cancelado";
            case "CAMBIO_ESTADO" -> "Pedido actualizado";
            default -> estado;
        };
    }
}