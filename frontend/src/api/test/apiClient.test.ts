import {beforeEach, describe, expect, it, vi} from "vitest";
import {apiClient} from "../apiClient";

vi.mock("../../utils/jwt", () => ({
  isTokenExpired: vi.fn(() => false),
}));

describe("apiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("debería hacer una petición GET correctamente", async () => {
    const mockResponse = {mensaje: "ok"};
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      text: async () => JSON.stringify(mockResponse),
    } as unknown as Response);

    const result = await apiClient("http://localhost:8080", "/api/test");

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: undefined,
    });

    expect(result).toEqual(mockResponse);
  });

  it("debería enviar token en Authorization si existe", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      text: async () => JSON.stringify({ok: true}),
    } as unknown as Response);

    await apiClient("http://localhost:8080", "/api/protegido", {
      token: "token123",
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/protegido", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
      body: undefined,
    });
  });

  it("debería enviar body como JSON en POST", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: {
        get: () => "application/json",
      },
      text: async () => JSON.stringify({id: 1}),
    } as unknown as Response);

    await apiClient("http://localhost:8080", "/api/pedidos", {
      method: "POST",
      body: {
        nombre: "Pedido test",
      },
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: "Pedido test",
      }),
    });
  });

  it("debería lanzar error si las credenciales son incorrectas", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: {
        get: () => "text/plain",
      },
      text: async () => "Credenciales incorrectas",
    } as unknown as Response);

    await expect(
      apiClient("http://localhost:8080", "/auth/login", {
        method: "POST",
        body: {
          correo: "test@test.com",
          contrasenia: "wrong",
        },
      }),
    ).rejects.toThrow("Credenciales incorrectas");
  });

  it("debería retornar null si la respuesta viene vacía", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: {
        get: () => null,
      },
      text: async () => "",
    } as unknown as Response);

    const result = await apiClient("http://localhost:8080", "/api/test");

    expect(result).toBeNull();
  });
});
