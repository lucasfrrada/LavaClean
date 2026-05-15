package mcsv.pedidos.infraestructure.client;


import mcsv.pedidos.api.dto.response.UsuarioResponseRest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mcsv-usuario", url = "http://localhost:8090")
public interface UsuarioClientRest {

    @GetMapping("api/usuarios/{id}")
    UsuarioResponseRest getUsuario(@PathVariable("id") Long id);

}
