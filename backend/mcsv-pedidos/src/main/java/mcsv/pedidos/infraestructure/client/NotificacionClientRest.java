package mcsv.pedidos.infraestructure.client;

import mcsv.pedidos.api.dto.request.Notificaciones.NotificacionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "mcsv-notificacion", url = "http://localhost:8081")
public interface NotificacionClientRest {

    @PostMapping("/api/notificaciones")
    void enviarNotificacion(@RequestBody NotificacionRequest request);
}