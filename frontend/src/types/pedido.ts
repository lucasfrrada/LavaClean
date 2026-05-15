export type Prenda = {
  idPrenda: number;
  nombrePrenda: string;
  categoria: string;
};

export type CreatePrendaRequest = {
  nombrePrenda: string;
  categoria: string;
};

export type UpdatePrendaRequest = {
  nombrePrenda: string;
  categoria: string;
};

export type Servicio = {
  idServicio: number;
  tipoServicio: string;
  precio: number;
};

export type CreateServicioRequest = {
  tipoServicio: string;
  precio: number;
};

export type UpdateServicioRequest = {
  tipoServicio: string;
  precio: number;
};

export type CreatePedidoRequest = {
  idUsuario: number;
  idPrenda: number;
  idServicio: number;
  cantidadPrendas: number;
  observaciones?: string;
};
