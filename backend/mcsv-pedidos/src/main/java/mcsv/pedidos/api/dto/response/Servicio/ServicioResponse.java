package mcsv.pedidos.api.dto.response.Servicio;

import lombok.Builder;
import lombok.Data;
import mcsv.pedidos.domain.model.ModalidadCobro;
import mcsv.pedidos.domain.model.TipoServicio;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ServicioResponse {

    private Long idServicio;
    private String tipoServicio;
    private BigDecimal precio;
    private BigDecimal precioBase;
    private String descripcion;
    private TipoServicio tipo;
    private ModalidadCobro modalidadCobro;
    private Boolean activo;
    private List<ServicioOpcionResponse> opciones;
}
