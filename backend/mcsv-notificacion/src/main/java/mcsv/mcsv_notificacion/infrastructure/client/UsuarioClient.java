package mcsv.mcsv_notificacion.infrastructure.client;

import mcsv.mcsv_notificacion.api.dto.UsuarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mcsv-usuario", url = "${services.usuario.url}")
public interface UsuarioClient {

    @GetMapping("/api/usuarios/{id}")
    UsuarioDTO obtenerUsuarioPorId(@PathVariable("id") Long id);

}
