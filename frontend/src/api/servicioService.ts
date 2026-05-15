import {apiClient} from "./apiClient";
import type {
  CreateServicioRequest,
  Servicio,
  UpdateServicioRequest,
} from "../types/pedido";

const PEDIDO_API_URL = import.meta.env.VITE_PEDIDO_API_URL;

export function getServiciosRequest(token: string) {
  return apiClient<Servicio[]>(PEDIDO_API_URL, "/servicios", {
    method: "GET",
    token,
  });
}

export function createServicioRequest(
  data: CreateServicioRequest,
  token: string,
) {
  return apiClient<Servicio>(PEDIDO_API_URL, "/servicios", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateServicioRequest(
  idServicio: number,
  data: UpdateServicioRequest,
  token: string,
) {
  return apiClient<Servicio>(PEDIDO_API_URL, `/servicios/${idServicio}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteServicioRequest(idServicio: number, token: string) {
  return apiClient<void>(PEDIDO_API_URL, `/servicios/${idServicio}`, {
    method: "DELETE",
    token,
  });
}
