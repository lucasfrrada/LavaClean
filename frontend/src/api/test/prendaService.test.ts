import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("prendaService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("debería obtener las prendas", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {getPrendasRequest} = await import("../prendaService");

    const prendasMock = [
      {
        idPrenda: 1,
        nombrePrenda: "Camisa",
        categoria: "Ropa",
      },
    ];

    apiClientMock.mockResolvedValue(prendasMock);

    await expect(getPrendasRequest("token-admin")).resolves.toEqual(
      prendasMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/prendas",
      {
        method: "GET",
        token: "token-admin",
      },
    );
  });

  it("debería crear una prenda", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {createPrendaRequest} = await import("../prendaService");

    const data = {
      nombrePrenda: "Pantalón",
      categoria: "Ropa",
    };

    const responseMock = {
      idPrenda: 2,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(createPrendaRequest(data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/prendas",
      {
        method: "POST",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería actualizar una prenda", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {updatePrendaRequest} = await import("../prendaService");

    const data = {
      nombrePrenda: "Camisa actualizada",
      categoria: "Ropa formal",
    };

    const responseMock = {
      idPrenda: 1,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(updatePrendaRequest(1, data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/prendas/1",
      {
        method: "PUT",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería eliminar una prenda", async () => {
    vi.stubEnv("VITE_PEDIDO_API_URL", "http://pedido-api");

    const {deletePrendaRequest} = await import("../prendaService");

    apiClientMock.mockResolvedValue(null);

    await expect(deletePrendaRequest(1, "token-admin")).resolves.toBeNull();

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://pedido-api",
      "/prendas/1",
      {
        method: "DELETE",
        token: "token-admin",
      },
    );
  });
});
