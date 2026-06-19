export type EstadoProducto = "ACTIVO" | "INACTIVO" | "BAJO_STOCK" | "AGOTADO";
export type TipoMovimientoInventario = "ENTRADA" | "SALIDA" | "AJUSTE";
export type EstadoCompra = "REGISTRADA" | "RECIBIDA" | "CANCELADA";

export type Producto = {
  idProducto: number;
  nombreProducto: string;
  descripcion?: string;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
  estado: EstadoProducto;
};

export type CrearProductoRequest = {
  nombreProducto: string;
  descripcion?: string;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
};

export type ActualizarProductoRequest = CrearProductoRequest & {
  estado: EstadoProducto;
};

export type MovimientoInventario = {
  idMovimiento: number;
  idProducto: number;
  nombreProducto: string;
  idCompraInventario?: number;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  fechaMovimiento: string;
  motivo?: string;
};

export type CrearMovimientoInventarioRequest = {
  idProducto: number;
  tipoMovimiento: TipoMovimientoInventario;
  cantidad: number;
  motivo?: string;
};

export type Proveedor = {
  idProveedor: number;
  nombreProveedor: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado?: string;
};
