package mcsv.pedidos.api.dto.request.Prenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ActualizarPrendaRequest {

    @NotBlank(message = "El nombre de la prenda es obligatorio")
    private String nombrePrenda;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @NotNull(message = "El peso de referencia es obligatorio")
    @DecimalMin(value = "0.001", message = "El peso de referencia debe ser mayor a cero")
    private BigDecimal pesoReferenciaKg;
}
