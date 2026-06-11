import {apiClient} from "./apiClient";
import type {LoginResponse} from "../types/auth";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

export type LoginRequest = {
  correo: string;
  contrasenia: string;
};

export function loginRequest(data: LoginRequest) {
  return apiClient<LoginResponse>(AUTH_API_URL, "/auth/login", {
    method: "POST",
    body: data,
  });
}
