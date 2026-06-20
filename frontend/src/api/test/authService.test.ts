import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("authService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("debería llamar a apiClient para iniciar sesión", async () => {
    vi.stubEnv("VITE_AUTH_API_URL", "http://auth-api");

    const {loginRequest} = await import("../authService");

    const data = {
      correo: "cliente@test.com",
      contrasenia: "password123",
    };

    const responseMock = {
      token: "token-test",
      message: "Login exitoso",
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(loginRequest(data)).resolves.toEqual(responseMock);

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://auth-api",
      "/auth/login",
      {
        method: "POST",
        body: data,
      },
    );
  });
});
