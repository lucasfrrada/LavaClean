import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import AdminServicesPage from "../AdminServicesPage";
import {useAuth} from "../../../context/AuthContext";
import {
  getServiciosRequest,
  createServicioRequest,
  updateServicioRequest,
  deleteServicioRequest,
} from "../../../api/servicioService";
import type {AuthUser} from "../../../types/auth";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/servicioService", () => ({
  getServiciosRequest: vi.fn(),
  createServicioRequest: vi.fn(),
  updateServicioRequest: vi.fn(),
  deleteServicioRequest: vi.fn(),
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

const serviciosMock = [
  {
    idServicio: 1,
    tipoServicio: "Lavado",
    precio: 3000,
  },
  {
    idServicio: 2,
    tipoServicio: "Planchado",
    precio: 2500,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminServicesPage />
    </MemoryRouter>,
  );
}

describe("AdminServicesPage", () => {
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

    vi.mocked(getServiciosRequest).mockResolvedValue(serviciosMock as never);
    vi.mocked(createServicioRequest).mockResolvedValue(
      serviciosMock[0] as never,
    );
    vi.mocked(updateServicioRequest).mockResolvedValue(
      serviciosMock[1] as never,
    );
    vi.mocked(deleteServicioRequest).mockResolvedValue(null as never);
  });

  it("debería cargar y mostrar los servicios", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getServiciosRequest).toHaveBeenCalledWith("token-admin");
    });

    expect(container.textContent).toContain("Lavado");
    expect(container.textContent).toContain("Planchado");
  });

  it("debería crear un servicio desde el formulario si existe", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getServiciosRequest).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll("input");

    expect(inputs.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(inputs[0], {
      target: {
        value: "Lavado premium",
      },
    });

    fireEvent.change(inputs[1], {
      target: {
        value: "7000",
      },
    });

    const submitButton = Array.from(container.querySelectorAll("button")).find(
      (button) => /crear|agregar|guardar/i.test(button.textContent ?? ""),
    );

    expect(submitButton).toBeDefined();

    fireEvent.click(submitButton as HTMLButtonElement);

    await waitFor(() => {
      expect(createServicioRequest).toHaveBeenCalled();
    });
  });

  it("debería eliminar un servicio si existe botón de eliminar", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getServiciosRequest).toHaveBeenCalled();
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
      expect(deleteServicioRequest).toHaveBeenCalled();
    });
  });
});
