package mcsv.pedidos.domain.model.entities;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name="pedidos")
@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    // Documentar en futuras entregas con Swagger
    // @Schema(description = "Primary key Pedido", example = "1")
    private Long idPedido;

    @Column(name = "estado_pedido")
    private String estado;

    @Column(name = "fecha_entrega")
    private LocalDate fecha_entrega;

    @Column(name = "fecha_llegada")
    private LocalDate fecha_llegada;

    @Column(name = "id_usuario")
    private Long idUsuario;

}
