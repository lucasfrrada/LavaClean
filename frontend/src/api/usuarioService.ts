import {apiClient} from "./apiClient";
import type {AuthUser, UserRole} from "../types/auth";

const USUARIO_API_URL = import.meta.env.VITE_USUARIO_API_URL;

export type RegisterRequest = {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  contrasenia: string;
  rol: "CLIENTE";
};

export type CreateClienteRequest = {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  contrasenia: string;
  rol: UserRole;
};

export type UpdateClienteRequest = {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  rol: UserRole;
};

export function registerRequest(data: RegisterRequest) {
  return apiClient<AuthUser>(USUARIO_API_URL, "/usuarios", {
    method: "POST",
    body: data,
  });
}

export function getUsuariosRequest(token: string) {
  return apiClient<AuthUser[]>(USUARIO_API_URL, "/usuarios", {
    method: "GET",
    token,
  });
}

export function createClienteRequest(
  data: CreateClienteRequest,
  token: string,
) {
  return apiClient<AuthUser>(USUARIO_API_URL, "/usuarios", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateClienteRequest(
  idUsuario: number,
  data: UpdateClienteRequest,
  token: string,
) {
  return apiClient<AuthUser>(USUARIO_API_URL, `/usuarios/${idUsuario}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteClienteRequest(idUsuario: number, token: string) {
  return apiClient<void>(USUARIO_API_URL, `/usuarios/${idUsuario}`, {
    method: "DELETE",
    token,
  });
}
