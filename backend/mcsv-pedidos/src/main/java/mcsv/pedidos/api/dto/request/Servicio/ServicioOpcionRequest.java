package mcsv.pedidos.api.dto.request.Servicio;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServicioOpcionRequest {
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    @NotNull
    @DecimalMin("0.0")
    private BigDecimal precio;
    private Boolean activo = true;
}
