import {apiClient} from "./apiClient";
import type {
  CreatePrendaRequest,
  Prenda,
  UpdatePrendaRequest,
} from "../types/pedido";

const PEDIDO_API_URL = import.meta.env.VITE_PEDIDO_API_URL;

export function getPrendasRequest(token: string) {
  return apiClient<Prenda[]>(PEDIDO_API_URL, "/prendas", {
    method: "GET",
    token,
  });
}

export function createPrendaRequest(data: CreatePrendaRequest, token: string) {
  return apiClient<Prenda>(PEDIDO_API_URL, "/prendas", {
    method: "POST",
    body: data,
    token,
  });
}

export function updatePrendaRequest(
  idPrenda: number,
  data: UpdatePrendaRequest,
  token: string,
) {
  return apiClient<Prenda>(PEDIDO_API_URL, `/prendas/${idPrenda}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deletePrendaRequest(idPrenda: number, token: string) {
  return apiClient<void>(PEDIDO_API_URL, `/prendas/${idPrenda}`, {
    method: "DELETE",
    token,
  });
}
