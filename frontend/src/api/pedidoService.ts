import {apiClient} from "./apiClient";
import type {CreatePedidoRequest} from "../types/pedido";

const PEDIDO_API_URL = import.meta.env.VITE_PEDIDO_API_URL;

export function createPedidoRequest(data: CreatePedidoRequest, token: string) {
  return apiClient(PEDIDO_API_URL, "/pedidos", {
    method: "POST",
    body: data,
    token,
  });
}
