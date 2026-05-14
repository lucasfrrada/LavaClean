package lavaclean.auth.infrastructure.client;

import lavaclean.auth.api.dto.UsuarioAuthDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mcsv-usuario", url = "localhost:8090")
public interface UsuarioClient {

    @GetMapping("/api/usuarios/{id}")
    UsuarioAuthDTO obtenerUsuarioPorId(@PathVariable("id") Long id);

}