import {describe, expect, it} from "vitest";

import type {Pedido} from "../types/pedido";
import {compararPedidosRecientesPrimero} from "./pedido";

function pedido(idPedido: number, fechaCreacion?: string) {
  return {idPedido, fechaCreacion} as Pedido;
}

describe("compararPedidosRecientesPrimero", () => {
  it("ordena primero los pedidos con fecha de creación más reciente", () => {
    const pedidos = [
      pedido(20, "2026-06-20T10:00:00"),
      pedido(10, "2026-06-21T10:00:00"),
    ];

    expect(pedidos.sort(compararPedidosRecientesPrimero).map((item) => item.idPedido))
      .toEqual([10, 20]);
  });

  it("usa el ID descendente para pedidos antiguos sin fecha", () => {
    const pedidos = [pedido(2), pedido(8), pedido(5)];

    expect(pedidos.sort(compararPedidosRecientesPrimero).map((item) => item.idPedido))
      .toEqual([8, 5, 2]);
  });
});
