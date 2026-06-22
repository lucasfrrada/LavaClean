import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import AdminUsersPage from "../AdminUsersPage";
import {useAuth} from "../../../context/AuthContext";
import {
  getUsuariosRequest,
  updateClienteRequest,
  deleteClienteRequest,
} from "../../../api/usuarioService";
import type {AuthUser} from "../../../types/auth";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/usuarioService", () => ({
  getUsuariosRequest: vi.fn(),
  createClienteRequest: vi.fn(),
  updateClienteRequest: vi.fn(),
  deleteClienteRequest: vi.fn(),
  registerRequest: vi.fn(),
}));

const usuarioAdminMock: AuthUser = {
  idUsuario: 1,
  nombres: "Admin",
  apPaterno: "Lava",
  apMaterno: "Clean",
  correo: "admin@test.com",
  telefono: 999999999,
  rol: "ADMINISTRADOR",
};

const usuariosMock = [
  {
    idUsuario: 2,
    nombres: "Cliente",
    apPaterno: "Uno",
    apMaterno: "Test",
    correo: "cliente1@test.com",
    telefono: 111111111,
    rol: "CLIENTE",
  },
  {
    idUsuario: 3,
    nombres: "Cliente",
    apPaterno: "Dos",
    apMaterno: "Test",
    correo: "cliente2@test.com",
    telefono: 222222222,
    rol: "CLIENTE",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>,
  );
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: usuarioAdminMock,
      token: "token-admin",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(getUsuariosRequest).mockResolvedValue(usuariosMock as never);
    vi.mocked(updateClienteRequest).mockResolvedValue(usuariosMock[0] as never);
    vi.mocked(deleteClienteRequest).mockResolvedValue(null as never);
  });

  it("debería cargar y mostrar los clientes", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getUsuariosRequest).toHaveBeenCalledWith("token-admin");
    });

    expect(container.textContent).toContain("cliente1@test.com");
    expect(container.textContent).toContain("cliente2@test.com");
    expect(container.textContent).toContain("CLIENTE");
    expect(container.textContent).toContain("Total registrados: 2");
  });

  it("debería eliminar un cliente si existe botón de eliminar", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getUsuariosRequest).toHaveBeenCalled();
    });

    const deleteButton = Array.from(container.querySelectorAll("button")).find(
      (button) => {
        const className = button.getAttribute("class") ?? "";
        return /red|rose|danger/i.test(className);
      },
    );

    expect(deleteButton).toBeDefined();

    fireEvent.click(deleteButton as HTMLButtonElement);

    await waitFor(() => {
      expect(deleteClienteRequest).toHaveBeenCalled();
    });
  });
});
