import {apiClient} from "./apiClient";
import type {
  CreatePedidoRequest,
  EstadoPedido,
  Pedido,
  UpdateEstadoPedidoRequest,
} from "../types/pedido";

const PEDIDO_API_URL = import.meta.env.VITE_PEDIDO_API_URL;

export function getPedidosRequest(token: string) {
  return apiClient<Pedido[]>(PEDIDO_API_URL, "/pedidos", {
    method: "GET",
    token,
  });
}

export function createPedidoRequest(data: CreatePedidoRequest, token: string) {
  return apiClient<Pedido>(PEDIDO_API_URL, "/pedidos", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateEstadoPedidoRequest(
  idPedido: number,
  estado: EstadoPedido,
  token: string,
) {
  const data: UpdateEstadoPedidoRequest = {estado};

  return apiClient<Pedido>(PEDIDO_API_URL, `/pedidos/${idPedido}/estado`, {
    method: "PATCH",
    body: data,
    token,
  });
}

export function deletePedidoRequest(idPedido: number, token: string) {
  return apiClient<void>(PEDIDO_API_URL, `/pedidos/${idPedido}`, {
    method: "DELETE",
    token,
  });
}
