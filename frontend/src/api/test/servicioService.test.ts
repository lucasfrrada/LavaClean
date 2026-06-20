import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("servicioService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("debería obtener los servicios", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {getServiciosRequest} = await import("../servicioService");

    const serviciosMock = [
      {
        idServicio: 1,
        tipoServicio: "Lavado",
        precio: 3000,
      },
    ];

    apiClientMock.mockResolvedValue(serviciosMock);

    await expect(getServiciosRequest("token-admin")).resolves.toEqual(
      serviciosMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/servicios",
      {
        method: "GET",
        token: "token-admin",
      },
    );
  });

  it("debería crear un servicio", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {createServicioRequest} = await import("../servicioService");

    const data = {
      tipoServicio: "Lavado premium",
      precio: 7000,
    };

    const responseMock = {
      idServicio: 2,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(createServicioRequest(data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/servicios",
      {
        method: "POST",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería actualizar un servicio", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {updateServicioRequest} = await import("../servicioService");

    const data = {
      tipoServicio: "Planchado premium",
      precio: 5000,
    };

    const responseMock = {
      idServicio: 1,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(
      updateServicioRequest(1, data, "token-admin"),
    ).resolves.toEqual(responseMock);

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/servicios/1",
      {
        method: "PUT",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería eliminar un servicio", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {deleteServicioRequest} = await import("../servicioService");

    apiClientMock.mockResolvedValue(null);

    await expect(deleteServicioRequest(1, "token-admin")).resolves.toBeNull();

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/servicios/1",
      {
        method: "DELETE",
        token: "token-admin",
      },
    );
  });
});
