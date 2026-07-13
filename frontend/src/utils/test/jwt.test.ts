import {beforeEach, describe, expect, it, vi} from "vitest";
import {getTokenPayload, isTokenExpired} from "../jwt";

const jwtDecodeMock = vi.hoisted(() => vi.fn());

vi.mock("jwt-decode", () => ({
  jwtDecode: jwtDecodeMock,
}));

describe("jwt utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  it("debería considerar expirado un token nulo", () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(jwtDecodeMock).not.toHaveBeenCalled();
  });

  it("debería detectar un token vigente", () => {
    jwtDecodeMock.mockReturnValueOnce({
      sub: "cliente@test.com",
      exp: 2_000,
      rol: "CLIENTE",
    });

    expect(isTokenExpired("token-vigente")).toBe(false);
    expect(jwtDecodeMock).toHaveBeenCalledWith("token-vigente");
  });

  it("debería detectar un token vencido", () => {
    jwtDecodeMock.mockReturnValueOnce({
      exp: 999,
    });

    expect(isTokenExpired("token-vencido")).toBe(true);
  });

  it("debería considerar expirado un token sin fecha exp", () => {
    jwtDecodeMock.mockReturnValueOnce({
      sub: "cliente@test.com",
    });

    expect(isTokenExpired("token-sin-exp")).toBe(true);
  });

  it("debería retornar null si no hay token o si el token es inválido", () => {
    expect(getTokenPayload(null)).toBeNull();

    jwtDecodeMock.mockImplementationOnce(() => {
      throw new Error("Token inválido");
    });

    expect(getTokenPayload("token-invalido")).toBeNull();
  });

  it("debería retornar el payload decodificado del token", () => {
    const payload = {
      sub: "admin@test.com",
      exp: 2_000,
      role: "ADMINISTRADOR",
    };

    jwtDecodeMock.mockReturnValueOnce(payload);

    expect(getTokenPayload("token-admin")).toEqual(payload);
  });
});
