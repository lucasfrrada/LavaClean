import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("pedidoService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("debería obtener todos los pedidos", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {getPedidosRequest} = await import("../pedidoService");

    const pedidosMock = [
      {
        idPedido: 1,
        idUsuario: 2,
        estado: "PENDIENTE",
        fechaLlegada: "2026-06-18",
        fechaEntrega: "2026-06-19",
        total: 6000,
        detalles: [],
      },
    ];

    apiClientMock.mockResolvedValue(pedidosMock);

    await expect(getPedidosRequest("token-admin")).resolves.toEqual(
      pedidosMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/pedidos",
      {
        method: "GET",
        token: "token-admin",
      },
    );
  });

  it("debería crear un pedido", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {createPedidoRequest} = await import("../pedidoService");

    const data = {
      idUsuario: 2,
      fechaLlegada: "2026-06-18",
      fechaEntrega: "2026-06-19",
      detalles: [
        {
          idPrenda: 1,
          idServicio: 1,
          cantidad: 2,
          observaciones: "Mancha difícil",
        },
      ],
    };

    const responseMock = {
      idPedido: 1,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(createPedidoRequest(data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/pedidos",
      {
        method: "POST",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería actualizar el estado de un pedido", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {updateEstadoPedidoRequest} = await import("../pedidoService");

    const responseMock = {
      idPedido: 1,
      estado: "EN_PROCESO",
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(
      updateEstadoPedidoRequest(1, "EN_PROCESO", "token-admin"),
    ).resolves.toEqual(responseMock);

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/pedidos/1/estado",
      {
        method: "PATCH",
        body: {
          estado: "EN_PROCESO",
        },
        token: "token-admin",
      },
    );
  });

  it("debería eliminar un pedido", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {deletePedidoRequest} = await import("../pedidoService");

    apiClientMock.mockResolvedValue(null);

    await expect(deletePedidoRequest(1, "token-admin")).resolves.toBeNull();

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/pedidos/1",
      {
        method: "DELETE",
        token: "token-admin",
      },
    );
  });
});
