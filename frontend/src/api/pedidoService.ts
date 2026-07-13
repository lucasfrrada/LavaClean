import {apiClient} from "./apiClient";
import type {
  CreatePedidoRequest,
  ConfirmarPesoRequest,
  EstadoPedido,
  Pedido,
  UpdateEstadoPedidoRequest,
  SeleccionServicioRequest,
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

export function confirmarPesoPedidoRequest(
  idPedido: number,
  pesoRealKg: number,
  token: string,
) {
  const data: ConfirmarPesoRequest = {pesoRealKg};

  return apiClient<Pedido>(
    PEDIDO_API_URL,
    `/pedidos/${idPedido}/confirmar-peso`,
    {method: "PATCH", body: data, token},
  );
}

export function deletePedidoRequest(idPedido: number, token: string) {
  return apiClient<void>(PEDIDO_API_URL, `/pedidos/${idPedido}`, {
    method: "DELETE",
    token,
  });
}

export function agregarServiciosExtrasRequest(
  idPedido: number,
  serviciosExtras: SeleccionServicioRequest[],
  token: string,
) {
  return apiClient<Pedido>(
    PEDIDO_API_URL,
    `/pedidos/${idPedido}/servicios-extras`,
    {method: "POST", body: {serviciosExtras}, token},
  );
}
