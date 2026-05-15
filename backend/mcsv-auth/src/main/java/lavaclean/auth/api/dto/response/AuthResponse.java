package lavaclean.auth.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;

    private Long idUsuario;
    private String nombres;
    private String apPaterno;
    private String apMaterno;
    private String correo;
    private Long telefono;
}
