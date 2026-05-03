package mcsv.mcsv_notificacion.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mcsv.mcsv_notificacion.api.dto.request.NotificacionRequest;
import mcsv.mcsv_notificacion.api.dto.response.NotificacionResponse;
import mcsv.mcsv_notificacion.application.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    // 1. Crear y enviar una nueva notificación
    @PostMapping
    public ResponseEntity<NotificacionResponse> enviarNotificacion(@RequestBody NotificacionRequest request){
        log.info("Peticion ");
    }
}
