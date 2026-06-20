import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import PerfilPage from "../PerfilPage";
import {useAuth} from "../../context/AuthContext";
import type {AuthUser} from "../../types/auth";

const actualizarUsuarioMock = vi.hoisted(() => vi.fn());
const obtenerUsuarioMock = vi.hoisted(() => vi.fn());

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/usuarioService", () => ({
  updateClienteRequest: actualizarUsuarioMock,
  updateUsuarioRequest: actualizarUsuarioMock,
  actualizarClienteRequest: actualizarUsuarioMock,
  actualizarUsuarioRequest: actualizarUsuarioMock,
  updatePerfilRequest: actualizarUsuarioMock,
  getUsuarioByIdRequest: obtenerUsuarioMock,
  getUsuarioRequest: obtenerUsuarioMock,
  getClienteRequest: obtenerUsuarioMock,
  getClienteByIdRequest: obtenerUsuarioMock,
}));

const usuarioClienteMock: AuthUser = {
  idUsuario: 2,
  nombres: "Lucas",
  apPaterno: "Cliente",
  apMaterno: "Test",
  correo: "cliente@test.com",
  telefono: 912345678,
  rol: "CLIENTE",
};

const usuarioActualizadoMock: AuthUser = {
  ...usuarioClienteMock,
  nombres: "Lucas Actualizado",
  telefono: 987654321,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <PerfilPage />
    </MemoryRouter>,
  );
}

function textoCompleto(container: HTMLElement) {
  const values = Array.from(
    container.querySelectorAll("input, textarea, select"),
  )
    .map((element) => (element as HTMLInputElement).value)
    .join(" ");

  return `${container.textContent ?? ""} ${values}`;
}

function obtenerBotonPorTexto(container: HTMLElement, regex: RegExp) {
  return Array.from(container.querySelectorAll("button")).find((button) =>
    regex.test(button.textContent ?? ""),
  );
}

describe("PerfilPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});

    actualizarUsuarioMock.mockResolvedValue(usuarioActualizadoMock);
    obtenerUsuarioMock.mockResolvedValue(usuarioClienteMock);

    vi.mocked(useAuth).mockReturnValue({
      user: usuarioClienteMock,
      token: "token-cliente",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("debería renderizar los datos del usuario autenticado", () => {
    const {container} = renderPage();

    expect(textoCompleto(container)).toContain("Lucas");
    expect(textoCompleto(container)).toContain("Cliente");
    expect(textoCompleto(container)).toContain("cliente@test.com");
  });

  it("debería permitir actualizar los datos del perfil", async () => {
    const updateUserMock = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: usuarioClienteMock,
      token: "token-cliente",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: updateUserMock,
    });

    const {container} = renderPage();

    const editButton = obtenerBotonPorTexto(
      container,
      /editar|modificar|actualizar/i,
    );

    if (editButton) {
      fireEvent.click(editButton);
    }

    const inputs = Array.from(container.querySelectorAll("input"));

    expect(inputs.length).toBeGreaterThan(0);

    const nombreInput =
      inputs.find((input) => /nombre/i.test(input.placeholder ?? "")) ??
      inputs[0];

    fireEvent.change(nombreInput, {
      target: {
        value: "Lucas Actualizado",
      },
    });

    const telefonoInput = inputs.find(
      (input) =>
        /tel[eé]fono/i.test(input.placeholder ?? "") ||
        input.value === "912345678",
    );

    if (telefonoInput) {
      fireEvent.change(telefonoInput, {
        target: {
          value: "987654321",
        },
      });
    }

    const form = container.querySelector("form");

    expect(form).toBeInTheDocument();

    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(actualizarUsuarioMock).toHaveBeenCalled();
    });
  });

  it("debería mostrar una vista controlada si no hay usuario autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    const {container} = renderPage();

    expect(textoCompleto(container)).toMatch(/perfil|usuario|sesi[oó]n|datos/i);
  });
});
