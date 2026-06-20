import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import AdminDashboardPage from "../AdminDashboardPage";
import {useAuth} from "../../../context/AuthContext";
import {getPedidosRequest} from "../../../api/pedidoService";
import {getUsuariosRequest} from "../../../api/usuarioService";
import {getServiciosRequest} from "../../../api/servicioService";
import type {AuthUser} from "../../../types/auth";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/pedidoService", () => ({
  getPedidosRequest: vi.fn(),
}));

vi.mock("../../../api/usuarioService", () => ({
  getUsuariosRequest: vi.fn(),
}));

vi.mock("../../../api/servicioService", () => ({
  getServiciosRequest: vi.fn(),
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

const pedidosMock = [
  {
    idPedido: 1,
    idUsuario: 2,
    estado: "REVISION",
    fechaLlegada: "2026-06-18",
    fechaEntrega: "2026-06-19",
    total: 6000,
    detalles: [],
  },
  {
    idPedido: 2,
    idUsuario: 3,
    estado: "ENTREGADO",
    fechaLlegada: "2026-06-17",
    fechaEntrega: "2026-06-18",
    total: 9000,
    detalles: [],
  },
];

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

const serviciosMock = [
  {
    idServicio: 1,
    tipoServicio: "Lavado",
    precio: 3000,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>,
  );
}

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.mocked(getServiciosRequest).mockResolvedValue(serviciosMock as never);
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: usuarioAdminMock,
      token: "token-admin",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(getPedidosRequest).mockResolvedValue(pedidosMock as never);
    vi.mocked(getUsuariosRequest).mockResolvedValue(usuariosMock as never);
  });

  it("debería cargar la información del dashboard administrativo", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPedidosRequest).toHaveBeenCalledWith("token-admin");
    });

    expect(getUsuariosRequest).toHaveBeenCalledWith("token-admin");

    expect(container.textContent).toMatch(/dashboard/i);
  });

  it("debería mostrar métricas calculadas desde los datos cargados", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPedidosRequest).toHaveBeenCalledWith("token-admin");
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain(
        "No se pudieron cargar los datos del dashboard",
      );
    });

    expect(container.textContent).toContain("Pedidos activos");
    expect(container.textContent).toContain("Clientes registrados");
    expect(container.textContent).toContain("Servicios disponibles");

    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("1");
  });
});
