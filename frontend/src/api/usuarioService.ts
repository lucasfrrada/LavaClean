import {apiClient} from "./apiClient";
import type {AuthUser} from "../types/auth";

const USUARIO_API_URL = import.meta.env.VITE_USUARIO_API_URL;

export type RegisterRequest = {
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  contrasenia: string;
  rol: "CLIENTE" | "ADMINISTRADOR";
};

export type RegisterResponse = AuthUser;

export function registerRequest(data: RegisterRequest) {
  return apiClient<RegisterResponse>(USUARIO_API_URL, "/usuarios", {
    method: "POST",
    body: data,
  });
}
