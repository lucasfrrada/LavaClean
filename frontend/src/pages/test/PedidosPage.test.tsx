import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import PedidosPage from "../PedidosPage";
import {useAuth} from "../../context/AuthContext";
import type {AuthUser} from "../../types/auth";

const obtenerPedidosMock = vi.hoisted(() => vi.fn());

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/pedidoService", () => ({
  getPedidosRequest: obtenerPedidosMock,
  getPedidosByUsuarioRequest: obtenerPedidosMock,
  getPedidosByClienteRequest: obtenerPedidosMock,
  getPedidosUsuarioRequest: obtenerPedidosMock,
  getPedidosClienteRequest: obtenerPedidosMock,
  getPedidosByIdUsuarioRequest: obtenerPedidosMock,
  getPedidoByUsuarioRequest: obtenerPedidosMock,
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

const pedidosMock = [
  {
    idPedido: 1,
    idUsuario: 2,
    estado: "REVISION",
    fechaLlegada: "2026-06-18",
    fechaEntrega: "2026-06-19",
    total: 6000,
    detalles: [
      {
        idDetallePedido: 1,
        prenda: "Camisa",
        categoriaPrenda: "Ropa",
        servicio: "Lavado",
        cantidad: 2,
        precioUnitario: 3000,
        subtotal: 6000,
        observaciones: "Mancha difícil",
      },
    ],
  },
  {
    idPedido: 2,
    idUsuario: 2,
    estado: "CONFIRMADO",
    fechaLlegada: "2026-06-20",
    fechaEntrega: "2026-06-21",
    total: 5000,
    detalles: [
      {
        idDetallePedido: 2,
        prenda: "Chaqueta",
        categoriaPrenda: "Abrigo",
        servicio: "Planchado",
        cantidad: 1,
        precioUnitario: 5000,
        subtotal: 5000,
        observaciones: "Sin observaciones",
      },
    ],
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <PedidosPage />
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

function abrirDetalleSiExiste(container: HTMLElement) {
  const button = Array.from(container.querySelectorAll("button")).find((item) =>
    /detalle|ver|más|mas/i.test(item.textContent ?? ""),
  );

  if (button) {
    fireEvent.click(button);
  }
}

describe("PedidosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: usuarioClienteMock,
      token: "token-cliente",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    obtenerPedidosMock.mockResolvedValue(pedidosMock);
  });

  it("debería cargar y mostrar los pedidos del cliente", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(obtenerPedidosMock).toHaveBeenCalled();
    });

    abrirDetalleSiExiste(container);

    await waitFor(() => {
      expect(textoCompleto(container)).toMatch(/camisa|chaqueta/i);
    });

    expect(textoCompleto(container)).toMatch(/lavado|planchado/i);
    expect(textoCompleto(container)).toMatch(/revisi[oó]n|confirmado/i);
  });

  it("debería mostrar un estado vacío cuando el cliente no tiene pedidos", async () => {
    obtenerPedidosMock.mockResolvedValueOnce([]);

    const {container} = renderPage();

    await waitFor(() => {
      expect(obtenerPedidosMock).toHaveBeenCalled();
    });

    expect(textoCompleto(container)).toMatch(
      /no tienes|no hay|sin pedidos|todav[ií]a/i,
    );
  });

  it("debería mantener renderizada la página si falla la carga de pedidos", async () => {
    obtenerPedidosMock.mockRejectedValueOnce(new Error("Error API"));

    const {container} = renderPage();

    await waitFor(() => {
      expect(obtenerPedidosMock).toHaveBeenCalled();
    });

    expect(textoCompleto(container)).toMatch(/pedido|mis pedidos/i);
  });
});
