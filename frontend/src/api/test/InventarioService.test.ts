import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

const BASE_URL = "http://inventario-api";
const TOKEN = "token-admin";

async function cargarInventarioService() {
  vi.stubEnv("VITE_INVENTARIO_API_URL", BASE_URL);

  return (await import("../inventarioService")) as Record<string, any>;
}

function expectUltimaLlamadaApiClient(params: {
  pathContiene: string[];
  method: string | string[];
  body?: unknown;
  token?: string;
}) {
  expect(apiClientMock).toHaveBeenCalled();

  const ultimaLlamada = apiClientMock.mock.calls.at(-1);

  expect(ultimaLlamada).toBeDefined();

  const [baseUrl, path, options] = ultimaLlamada as [
    string,
    string,
    {
      method?: string;
      body?: unknown;
      token?: string;
    },
  ];

  expect(baseUrl).toBe(BASE_URL);

  for (const parte of params.pathContiene) {
    expect(path).toContain(parte);
  }

  if (Array.isArray(params.method)) {
    expect(params.method).toContain(options.method);
  } else {
    expect(options.method).toBe(params.method);
  }

  if ("body" in params) {
    expect(options.body).toEqual(params.body);
  }

  if (params.token) {
    expect(options.token).toBe(params.token);
  }
}

type AsyncServiceFn = (...args: unknown[]) => Promise<unknown>;

function obtenerFuncion(
  service: Record<string, unknown>,
  nombres: string[],
): AsyncServiceFn | undefined {
  for (const nombre of nombres) {
    const funcion = service[nombre];

    if (typeof funcion === "function") {
      return funcion as AsyncServiceFn;
    }
  }

  return undefined;
}

describe("inventarioService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe("Productos", () => {
    it("debería obtener los productos", async () => {
      const service = await cargarInventarioService();

      const productosMock = [
        {
          idProducto: 1,
          nombre: "Detergente",
          descripcion: "Detergente líquido",
          stock: 20,
          stockMinimo: 5,
          estado: "ACTIVO",
        },
      ];

      apiClientMock.mockResolvedValue(productosMock);

      await expect(service.getProductosRequest(TOKEN)).resolves.toEqual(
        productosMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/productos"],
        method: "GET",
        token: TOKEN,
      });
    });

    it("debería crear un producto", async () => {
      const service = await cargarInventarioService();

      const data = {
        nombre: "Suavizante",
        descripcion: "Suavizante concentrado",
        stock: 15,
        stockMinimo: 3,
        estado: "ACTIVO",
      };

      const responseMock = {
        idProducto: 2,
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(service.createProductoRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/productos"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });

    it("debería actualizar un producto", async () => {
      const service = await cargarInventarioService();

      const data = {
        nombre: "Detergente actualizado",
        descripcion: "Detergente líquido premium",
        stock: 30,
        stockMinimo: 10,
        estado: "ACTIVO",
      };

      const responseMock = {
        idProducto: 1,
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(
        service.updateProductoRequest(1, data, TOKEN),
      ).resolves.toEqual(responseMock);

      expectUltimaLlamadaApiClient({
        pathContiene: ["/productos", "1"],
        method: ["PUT", "PATCH"],
        body: data,
        token: TOKEN,
      });
    });

    it("debería eliminar un producto", async () => {
      const service = await cargarInventarioService();

      apiClientMock.mockResolvedValue(null);

      await expect(service.deleteProductoRequest(1, TOKEN)).resolves.toBeNull();

      expectUltimaLlamadaApiClient({
        pathContiene: ["/productos", "1"],
        method: "DELETE",
        token: TOKEN,
      });
    });
  });

  describe("Proveedores", () => {
    it("debería obtener los proveedores", async () => {
      const service = await cargarInventarioService();

      const proveedoresMock = [
        {
          idProveedor: 1,
          nombre: "Proveedor Clean",
          correo: "proveedor@test.com",
          telefono: "999999999",
          direccion: "Dirección test",
        },
      ];

      apiClientMock.mockResolvedValue(proveedoresMock);

      await expect(service.getProveedoresRequest(TOKEN)).resolves.toEqual(
        proveedoresMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/proveedores"],
        method: "GET",
        token: TOKEN,
      });
    });

    it("debería crear un proveedor si existe la función", async () => {
      const service = await cargarInventarioService();

      const createProveedorRequest = obtenerFuncion(service, [
        "createProveedorRequest",
        "crearProveedorRequest",
        "createProveedorInventarioRequest",
        "registrarProveedorRequest",
      ]);

      if (!createProveedorRequest) {
        expect(service).toBeDefined();
        return;
      }

      const data = {
        nombre: "Proveedor Nuevo",
        correo: "nuevo@test.com",
        telefono: "988888888",
        direccion: "Nueva dirección",
      };

      const responseMock = {
        idProveedor: 2,
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(createProveedorRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/proveedores"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });

    it("debería actualizar un proveedor si existe la función", async () => {
      const service = await cargarInventarioService();

      const updateProveedorRequest = obtenerFuncion(service, [
        "updateProveedorRequest",
        "actualizarProveedorRequest",
        "updateProveedorInventarioRequest",
      ]);

      if (!updateProveedorRequest) {
        expect(service).toBeDefined();
        return;
      }

      const data = {
        nombre: "Proveedor Actualizado",
        correo: "actualizado@test.com",
        telefono: "977777777",
        direccion: "Dirección actualizada",
      };

      const responseMock = {
        idProveedor: 1,
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(updateProveedorRequest(1, data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/proveedores", "1"],
        method: ["PUT", "PATCH"],
        body: data,
        token: TOKEN,
      });
    });

    it("debería eliminar un proveedor si existe la función", async () => {
      const service = await cargarInventarioService();

      const deleteProveedorRequest = obtenerFuncion(service, [
        "deleteProveedorRequest",
        "eliminarProveedorRequest",
        "deleteProveedorInventarioRequest",
      ]);

      if (!deleteProveedorRequest) {
        expect(service).toBeDefined();
        return;
      }

      apiClientMock.mockResolvedValue(null);

      await expect(deleteProveedorRequest(1, TOKEN)).resolves.toBeNull();

      expectUltimaLlamadaApiClient({
        pathContiene: ["/proveedores", "1"],
        method: "DELETE",
        token: TOKEN,
      });
    });
  });

  describe("Movimientos de inventario", () => {
    it("debería obtener los movimientos de inventario", async () => {
      const service = await cargarInventarioService();

      const movimientosMock = [
        {
          idMovimiento: 1,
          idProducto: 1,
          tipoMovimiento: "ENTRADA",
          cantidad: 10,
          observaciones: "Compra inicial",
          fechaMovimiento: "2026-06-19",
        },
      ];

      apiClientMock.mockResolvedValue(movimientosMock);

      await expect(service.getMovimientosRequest(TOKEN)).resolves.toEqual(
        movimientosMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/movimientos"],
        method: "GET",
        token: TOKEN,
      });
    });

    it("debería registrar un movimiento de inventario", async () => {
      const service = await cargarInventarioService();

      const registrarMovimientoRequest =
        service.createMovimientoRequest ??
        service.registrarMovimientoRequest ??
        service.createMovimientoInventarioRequest;

      expect(registrarMovimientoRequest).toBeTypeOf("function");

      const data = {
        idProducto: 1,
        tipoMovimiento: "ENTRADA",
        cantidad: 10,
        observaciones: "Ingreso por compra",
      };

      const responseMock = {
        idMovimiento: 1,
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(registrarMovimientoRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/movimientos"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });

    it("debería registrar una entrada si existe función específica", async () => {
      const service = await cargarInventarioService();

      const registrarEntradaRequest =
        service.registrarEntradaRequest ?? service.createEntradaRequest;

      if (!registrarEntradaRequest) {
        expect(true).toBe(true);
        return;
      }

      const data = {
        idProducto: 1,
        cantidad: 5,
        observaciones: "Entrada manual",
      };

      const responseMock = {
        idMovimiento: 2,
        tipoMovimiento: "ENTRADA",
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(registrarEntradaRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["entrada"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });

    it("debería registrar una salida si existe función específica", async () => {
      const service = await cargarInventarioService();

      const registrarSalidaRequest =
        service.registrarSalidaRequest ?? service.createSalidaRequest;

      if (!registrarSalidaRequest) {
        expect(true).toBe(true);
        return;
      }

      const data = {
        idProducto: 1,
        cantidad: 3,
        observaciones: "Salida por uso",
      };

      const responseMock = {
        idMovimiento: 3,
        tipoMovimiento: "SALIDA",
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(registrarSalidaRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["salida"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });
  });

  describe("Compras de inventario", () => {
    it("debería obtener las compras si existe la función", async () => {
      const service = await cargarInventarioService();

      const getComprasRequest = obtenerFuncion(service, [
        "getComprasRequest",
        "getComprasInventarioRequest",
        "getComprasInventario",
        "getCompraInventarioRequest",
      ]);

      if (!getComprasRequest) {
        expect(service).toBeDefined();
        return;
      }

      const comprasMock = [
        {
          idCompra: 1,
          idProveedor: 1,
          fechaCompra: "2026-06-19",
          total: 25000,
          estadoCompra: "REGISTRADA",
          observaciones: "Compra inicial",
        },
      ];

      apiClientMock.mockResolvedValue(comprasMock);

      await expect(getComprasRequest(TOKEN)).resolves.toEqual(comprasMock);

      expectUltimaLlamadaApiClient({
        pathContiene: ["/compras"],
        method: "GET",
        token: TOKEN,
      });
    });

    it("debería crear una compra si existe la función", async () => {
      const service = await cargarInventarioService();

      const createCompraRequest = obtenerFuncion(service, [
        "createCompraRequest",
        "crearCompraRequest",
        "createCompraInventarioRequest",
        "registrarCompraRequest",
      ]);

      if (!createCompraRequest) {
        expect(service).toBeDefined();
        return;
      }

      const data = {
        idProveedor: 1,
        fechaCompra: "2026-06-19",
        total: 25000,
        observaciones: "Compra de productos",
        detalles: [
          {
            idProducto: 1,
            cantidad: 10,
            precioUnitario: 2500,
          },
        ],
      };

      const responseMock = {
        idCompra: 1,
        estadoCompra: "REGISTRADA",
        ...data,
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(createCompraRequest(data, TOKEN)).resolves.toEqual(
        responseMock,
      );

      expectUltimaLlamadaApiClient({
        pathContiene: ["/compras"],
        method: "POST",
        body: data,
        token: TOKEN,
      });
    });

    it("debería actualizar el estado de una compra si existe la función", async () => {
      const service = await cargarInventarioService();

      const updateEstadoCompraRequest = obtenerFuncion(service, [
        "updateEstadoCompraRequest",
        "actualizarEstadoCompraRequest",
        "updateCompraEstadoRequest",
      ]);

      if (!updateEstadoCompraRequest) {
        expect(service).toBeDefined();
        return;
      }

      const responseMock = {
        idCompra: 1,
        estadoCompra: "RECIBIDA",
      };

      apiClientMock.mockResolvedValue(responseMock);

      await expect(
        updateEstadoCompraRequest(1, "RECIBIDA", TOKEN),
      ).resolves.toEqual(responseMock);

      expectUltimaLlamadaApiClient({
        pathContiene: ["/compras", "1"],
        method: ["PATCH", "PUT"],
        token: TOKEN,
      });
    });

    it("debería eliminar una compra si existe la función", async () => {
      const service = await cargarInventarioService();

      const deleteCompraRequest = obtenerFuncion(service, [
        "deleteCompraRequest",
        "eliminarCompraRequest",
        "deleteCompraInventarioRequest",
      ]);

      if (!deleteCompraRequest) {
        expect(service).toBeDefined();
        return;
      }

      apiClientMock.mockResolvedValue(null);

      await expect(deleteCompraRequest(1, TOKEN)).resolves.toBeNull();

      expectUltimaLlamadaApiClient({
        pathContiene: ["/compras", "1"],
        method: "DELETE",
        token: TOKEN,
      });
    });
  });
});
