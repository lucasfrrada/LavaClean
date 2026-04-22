package mcsv.pedidos.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import mcsv.pedidos.domain.model.EstadoPedido;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name="pedidos")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    // Documentar en futuras entregas con Swagger
    // @Schema(description = "Primary key Pedido", example = "1")
    private Long idPedido;

    @Column(name = "estado_pedido")
    private EstadoPedido estado;

    @Column(name = "fecha_entrega")
    private LocalDate fecha_entrega;

    @Column(name = "fecha_llegada")
    private LocalDate fecha_llegada;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "total")
    private BigDecimal total;
}
