package mcsv.pedidos.api.dto.request.Servicio;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CrearServicioRequest {

    @NotBlank(message = "El tipo de servicio es obligatorio")
    private String tipoServicio;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    private BigDecimal precio;

    private String descripcion;

    private TipoServicio tipo;

    private ModalidadCobro modalidadCobro;

    private Boolean activo = true;

    private List<ServicioOpcionRequest> opciones = new ArrayList<>();
}
