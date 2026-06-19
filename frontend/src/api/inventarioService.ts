import {apiClient} from "./apiClient";
import type {
  ActualizarProductoRequest,
  CrearMovimientoInventarioRequest,
  CrearProductoRequest,
  MovimientoInventario,
  Producto,
  Proveedor,
  TipoMovimientoInventario,
} from "../types/inventario";

const INVENTARIO_API_URL = import.meta.env.VITE_INVENTARIO_API_URL;

export function getProductosRequest(token: string) {
  return apiClient<Producto[]>(INVENTARIO_API_URL, "/productos", {
    method: "GET",
    token,
  });
}

export function createProductoRequest(
  data: CrearProductoRequest,
  token: string,
) {
  return apiClient<Producto>(INVENTARIO_API_URL, "/productos", {
    method: "POST",
    body: data,
    token,
  });
}

export function updateProductoRequest(
  idProducto: number,
  data: ActualizarProductoRequest,
  token: string,
) {
  return apiClient<Producto>(INVENTARIO_API_URL, `/productos/${idProducto}`, {
    method: "PUT",
    body: data,
    token,
  });
}

export function deleteProductoRequest(idProducto: number, token: string) {
  return apiClient<void>(INVENTARIO_API_URL, `/productos/${idProducto}`, {
    method: "DELETE",
    token,
  });
}

export function getMovimientosRequest(token: string) {
  return apiClient<MovimientoInventario[]>(
    INVENTARIO_API_URL,
    "/movimientos-inventario",
    {
      method: "GET",
      token,
    },
  );
}

export function createMovimientoRequest(
  data: CrearMovimientoInventarioRequest,
  token: string,
) {
  return apiClient<MovimientoInventario>(
    INVENTARIO_API_URL,
    "/movimientos-inventario",
    {
      method: "POST",
      body: data,
      token,
    },
  );
}

export function getMovimientosByTipoRequest(
  tipoMovimiento: TipoMovimientoInventario,
  token: string,
) {
  return apiClient<MovimientoInventario[]>(
    INVENTARIO_API_URL,
    `/movimientos-inventario/tipo/${tipoMovimiento}`,
    {
      method: "GET",
      token,
    },
  );
}

export function getProveedoresRequest(token: string) {
  return apiClient<Proveedor[]>(INVENTARIO_API_URL, "/proveedores", {
    method: "GET",
    token,
  });
}
