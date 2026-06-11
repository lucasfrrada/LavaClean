package lavaclean.mcsv_pago.application.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "msvc-usuario", url = "http://localhost:8090")
public interface UsuarioClient {

    // Cambia "UsuarioDTO" por el DTO correspondiente que tengas en msvc-usuario para exponer datos básicos
    @GetMapping("/api/usuarios/{id}")
    Object obtenerUsuarioPorId(@PathVariable("id") Long id);
}