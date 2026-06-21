export type Prenda = {
  idPrenda: number;
  nombrePrenda: string;
  categoria: string;
  pesoReferenciaKg?: number;
};

export type CreatePrendaRequest = {
  nombrePrenda: string;
  categoria: string;
  pesoReferenciaKg?: number;
};

export type UpdatePrendaRequest = {
  nombrePrenda: string;
  categoria: string;
  pesoReferenciaKg?: number;
};

export type Servicio = {
  idServicio: number;
  tipoServicio: string;
  descripcion?: string;
  tipo?: TipoServicio;
  modalidadCobro?: ModalidadCobro;
  activo?: boolean;
  precioBase?: number;
  opciones?: ServicioOpcion[];
  precioPorCarga?: number;
  /** Compatibilidad temporal con respuestas del catálogo anterior. */
  precio?: number;
};

export type CreateServicioRequest = {
  tipoServicio: string;
  descripcion?: string;
  tipo?: TipoServicio;
  modalidadCobro?: ModalidadCobro;
  activo?: boolean;
  opciones?: ServicioOpcionRequest[];
  precioPorCarga?: number;
  precio?: number;
};

export type UpdateServicioRequest = {
  tipoServicio: string;
  descripcion?: string;
  tipo?: TipoServicio;
  modalidadCobro?: ModalidadCobro;
  activo?: boolean;
  opciones?: ServicioOpcionRequest[];
  precioPorCarga?: number;
  precio?: number;
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
  pesoReferenciaKg?: number;
  pesoEstimadoKg?: number;
};

export type Pedido = {
  idPedido: number;
  idUsuario: number;
  estado: EstadoPedido;
  fechaLlegada: string;
  fechaEntrega: string;
  fecha_llegada?: string;
  fecha_entrega?: string;
  pesoEstimadoKg: number;
  precioPorCarga: number;
  cargasEstimadas: number;
  precioEstimado: number;
  pesoRealKg: number | null;
  cargasReales: number | null;
  precioFinal: number | null;
  total: number;
  detalles: DetallePedido[];
  servicioBase?: PedidoServicio | null;
  serviciosExtras?: PedidoServicio[];
  observacionesCliente?: string;
  observacionesInternas?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

type CreatePedidoBase = {
  idUsuario: number;
  idServicioBase?: number;
  opcionBaseCodigo?: string;
  observacionesServicioBase?: string;
  observacionesCliente?: string;
  serviciosExtras?: SeleccionServicioRequest[];
  detalles: {
    idPrenda: number;
    idServicio?: number;
    cantidad: number;
    observaciones?: string;
  }[];
};

export type CreatePedidoRequest = CreatePedidoBase &
  (
    | {fecha_llegada: string; fecha_entrega: string}
    | {fechaLlegada: string; fechaEntrega: string}
  );

export type ConfirmarPesoRequest = {
  pesoRealKg: number;
};

export type UpdateEstadoPedidoRequest = {
  estado: EstadoPedido;
};

export type EstadoPedido =
  | "PENDIENTE_CONFIRMACION"
  | "PENDIENTE_PESAJE"
  | "LISTO_PARA_RETIRO"
  | "REVISION"
  | "CONFIRMADO"
  | "EN_PROCESO"
  | "COMPLETADO"
  | "ENTREGADO"
  | "PAGADO"
  | "CANCELADO";

export type TipoServicio = "BASE" | "EXTRA";
export type ModalidadCobro = "POR_CARGA" | "FIJO" | "POR_OPCION";

export type ServicioOpcion = {
  idServicioOpcion: number;
  codigo: string;
  nombre: string;
  precio: number;
  activo: boolean;
};

export type ServicioOpcionRequest = Omit<ServicioOpcion, "idServicioOpcion">;

export type SeleccionServicioRequest = {
  idServicio: number;
  opcionCodigo?: string;
  cantidad?: number;
  observaciones?: string;
};

export type PedidoServicio = {
  idPedidoServicio: number;
  idServicio: number;
  nombre: string;
  tipo: TipoServicio;
  modalidadCobro: ModalidadCobro;
  opcionCodigo?: string;
  opcionNombre?: string;
  cantidad: number;
  observaciones?: string;
  precioUnitario: number;
  precioEstimado: number;
  precioFinal: number | null;
};
