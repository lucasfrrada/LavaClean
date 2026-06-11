package mcsv.pedidos.api.dto.request.Prenda;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearPrendaRequest {

    @NotBlank(message = "El nombre de la prenda es obligatorio")
    private String nombrePrenda;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;
}