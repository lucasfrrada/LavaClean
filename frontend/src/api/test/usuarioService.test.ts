import {beforeEach, describe, expect, it, vi} from "vitest";

const apiClientMock = vi.hoisted(() => vi.fn());

vi.mock("../apiClient", () => ({
  apiClient: apiClientMock,
}));

describe("usuarioService", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("debería registrar un cliente", async () => {
    vi.stubEnv("VITE_USUARIO_API_URL", "http://usuario-api");

    const {registerRequest} = await import("../usuarioService");

    const data = {
      nombres: "Lucas",
      apPaterno: "Cliente",
      apMaterno: "Test",
      correo: "cliente@test.com",
      telefono: 912345678,
      contrasenia: "password123",
      rol: "CLIENTE" as const,
    };

    const responseMock = {
      idUsuario: 1,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(registerRequest(data)).resolves.toEqual(responseMock);

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://usuario-api",
      "/usuarios",
      {
        method: "POST",
        body: data,
      },
    );
  });

  it("debería obtener todos los usuarios", async () => {
    vi.stubEnv("VITE_USUARIO_API_URL", "http://usuario-api");

    const {getUsuariosRequest} = await import("../usuarioService");

    const usuariosMock = [
      {
        idUsuario: 1,
        nombres: "Lucas",
        apPaterno: "Cliente",
        apMaterno: "Test",
        correo: "cliente@test.com",
        telefono: 912345678,
        rol: "CLIENTE",
      },
    ];

    apiClientMock.mockResolvedValue(usuariosMock);

    await expect(getUsuariosRequest("token-admin")).resolves.toEqual(
      usuariosMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://usuario-api",
      "/usuarios",
      {
        method: "GET",
        token: "token-admin",
      },
    );
  });

  it("debería crear un cliente desde administración", async () => {
    vi.stubEnv("VITE_USUARIO_API_URL", "http://usuario-api");

    const {createClienteRequest} = await import("../usuarioService");

    const data = {
      nombres: "Cliente",
      apPaterno: "Nuevo",
      apMaterno: "Admin",
      correo: "nuevo@test.com",
      telefono: 987654321,
      contrasenia: "password123",
      rol: "CLIENTE" as const,
    };

    const responseMock = {
      idUsuario: 2,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(createClienteRequest(data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://usuario-api",
      "/usuarios",
      {
        method: "POST",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería actualizar un cliente", async () => {
    vi.stubEnv("VITE_USUARIO_API_URL", "http://usuario-api");

    const {updateClienteRequest} = await import("../usuarioService");

    const data = {
      nombres: "Cliente Actualizado",
      apPaterno: "Nuevo",
      apMaterno: "Admin",
      correo: "actualizado@test.com",
      telefono: 987654321,
      rol: "CLIENTE" as const,
    };

    const responseMock = {
      idUsuario: 2,
      ...data,
    };

    apiClientMock.mockResolvedValue(responseMock);

    await expect(updateClienteRequest(2, data, "token-admin")).resolves.toEqual(
      responseMock,
    );

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://usuario-api",
      "/usuarios/2",
      {
        method: "PUT",
        body: data,
        token: "token-admin",
      },
    );
  });

  it("debería eliminar un cliente", async () => {
    vi.stubEnv("VITE_USUARIO_API_URL", "http://usuario-api");

    const {deleteClienteRequest} = await import("../usuarioService");

    apiClientMock.mockResolvedValue(null);

    await expect(deleteClienteRequest(2, "token-admin")).resolves.toBeNull();

    expect(apiClientMock).toHaveBeenCalledWith(
      "http://usuario-api",
      "/usuarios/2",
      {
        method: "DELETE",
        token: "token-admin",
      },
    );
  });
});
