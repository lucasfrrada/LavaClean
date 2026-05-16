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

export type DetallePedido = {
  idPedido: number;
  prenda: string;
  categoriaPrenda: string;
  servicio: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  observaciones?: string;
};

export type Pedido = {
  idPedido: number;
  idUsuario: number;
  estado: EstadoPedido;
  fechaLlegada: string;
  fechaEntrega: string;
  total: number;
  detalles: DetallePedido[];
};

export type CreatePedidoRequest = {
  idUsuario: number;
  fechaLlegada: string;
  fechaEntrega: string;
  detalles: {
    idPrenda: number;
    idServicio: number;
    cantidad: number;
    observaciones?: string;
  }[];
};

export type UpdateEstadoPedidoRequest = {
  estado: EstadoPedido;
};

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "COMPLETADO"
  | "PAGADO"
  | "CANCELADO";
