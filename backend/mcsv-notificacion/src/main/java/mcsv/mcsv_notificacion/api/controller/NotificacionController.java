package mcsv.mcsv_notificacion.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;
import mcsv.mcsv_notificacion.application.service.NotificacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    // 1. Crear y enviar una nueva notificación
    @PostMapping
    public ResponseEntity<NotificacionResponse> enviarNotificacion(@RequestBody NotificacionRequest request){
        log.info("Enviar notificación a usuario con ID:{}",request.getIdUsuario());
        NotificacionResponse response = notificacionService.crearYEnviarNotificacion(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Consultar notificaciones de un usuario específico
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<NotificacionResponse>> obtenerPorUsuario(@PathVariable Long idUsuario){
        log.info("Petición para consultar el historial del usuario:{}",idUsuario);

        List<NotificacionResponse> historial = notificacionService.obtenerNotificacionesPorUsuario(idUsuario);

        return ResponseEntity.ok(historial);
    }

    // 3. Consultar notificaciones de un pedido específico
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<NotificacionResponse>> obtenerPorPedido(@PathVariable Long idPedido) {
        log.info("Petición para consultar historial del pedido: {}", idPedido);
        List<NotificacionResponse> respuestas = notificacionService.obtenerNotificacionesPorPedido(idPedido);

        return ResponseEntity.ok(respuestas);
    }

    // 4. Endpoint manual para reintentar envíos fallidos
    @PostMapping("/reintentar-fallidas")
    public ResponseEntity<String> reintentarFallidas() {
        log.info("Petición para ejecutar reintento manual de notificaciones");
        notificacionService.reintentarNotificacionesFallidas();

        return ResponseEntity.ok("Proceso de reintento ejecutado. Revisa los logs para más detalles.");
    }

}
