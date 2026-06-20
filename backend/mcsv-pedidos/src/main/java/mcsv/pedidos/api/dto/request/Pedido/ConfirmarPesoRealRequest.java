package mcsv.pedidos.api.dto.request.Pedido;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfirmarPesoRealRequest {

    @NotNull(message = "El peso real es obligatorio")
    @DecimalMin(value = "0.001", message = "El peso real debe ser mayor a cero")
    private BigDecimal pesoRealKg;
}
