export type UserRole = "CLIENTE" | "ADMINISTRADOR";

export type AuthUser = {
  idUsuario: number;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  rol?: UserRole;
};

export type LoginResponse = {
  token: string;
  message: string;
  idUsuario: number;
  nombres: string;
  apPaterno: string;
  apMaterno: string;
  correo: string;
  telefono: number;
  rol?: UserRole;
};
