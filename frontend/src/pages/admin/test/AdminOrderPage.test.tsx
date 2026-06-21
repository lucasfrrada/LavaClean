import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import AdminOrdersPage from "../AdminOrdersPage";
import {useAuth} from "../../../context/AuthContext";
import {
  getPedidosRequest,
  createPedidoRequest,
  updateEstadoPedidoRequest,
  deletePedidoRequest,
} from "../../../api/pedidoService";
import {getUsuariosRequest} from "../../../api/usuarioService";
import {getPrendasRequest} from "../../../api/prendaService";
import {
  getServiciosBaseRequest,
  getServiciosExtrasRequest,
} from "../../../api/servicioService";
import type {AuthUser} from "../../../types/auth";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/pedidoService", () => ({
  getPedidosRequest: vi.fn(),
  createPedidoRequest: vi.fn(),
  updateEstadoPedidoRequest: vi.fn(),
  deletePedidoRequest: vi.fn(),
}));

vi.mock("../../../api/usuarioService", () => ({
  getUsuariosRequest: vi.fn(),
}));

vi.mock("../../../api/prendaService", () => ({
  getPrendasRequest: vi.fn(),
}));

vi.mock("../../../api/servicioService", () => ({
  getServiciosBaseRequest: vi.fn(),
  getServiciosExtrasRequest: vi.fn(),
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
    detalles: [
      {
        idPedido: 1,
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
    idUsuario: 3,
    estado: "CONFIRMADO",
    fechaLlegada: "2026-06-20",
    fechaEntrega: "2026-06-21",
    total: 5000,
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

const prendasMock = [
  {
    idPrenda: 1,
    nombrePrenda: "Camisa",
    categoria: "Ropa",
  },
  {
    idPrenda: 2,
    nombrePrenda: "Chaqueta",
    categoria: "Abrigo",
  },
];

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
  {
    idServicio: 3,
    tipoServicio: "Lavado de chaqueta",
    precio: 0,
    tipo: "BASE",
    modalidadCobro: "POR_OPCION",
    activo: true,
    opciones: [
      {
        idServicioOpcion: 1,
        codigo: "LARGA",
        nombre: "Larga",
        precio: 10000,
        activo: true,
      },
    ],
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminOrdersPage />
    </MemoryRouter>,
  );
}

function obtenerSelectEstadoPedido(container: HTMLElement) {
  const selects = Array.from(container.querySelectorAll("select"));

  return selects.find((select) => {
    const values = Array.from(select.options).map((option) => option.value);

    return (
      select.value === "REVISION" &&
      values.includes("CONFIRMADO") &&
      values.includes("CANCELADO")
    );
  }) as HTMLSelectElement | undefined;
}

describe("AdminOrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockReturnValue(true);

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
    vi.mocked(getPrendasRequest).mockResolvedValue(prendasMock as never);
    vi.mocked(getServiciosBaseRequest).mockResolvedValue(serviciosMock as never);
    vi.mocked(getServiciosExtrasRequest).mockResolvedValue([]);

    vi.mocked(createPedidoRequest).mockResolvedValue(pedidosMock[0] as never);

    vi.mocked(updateEstadoPedidoRequest).mockResolvedValue({
      ...pedidosMock[0],
      estado: "CONFIRMADO",
    } as never);

    vi.mocked(deletePedidoRequest).mockResolvedValue(null as never);
  });

  it("debería cargar y mostrar los pedidos del sistema", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPedidosRequest).toHaveBeenCalledWith("token-admin");
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain(
        "No se pudieron cargar los pedidos",
      );
    });

    await waitFor(() => {
      expect(container.textContent).toContain("Total registrados: 2");
    });

    expect(container.textContent).toContain("Revisión");
    expect(container.textContent).toContain("Confirmado");
  });

  it("debería mostrar información del detalle del pedido", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPedidosRequest).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(container.textContent).toContain("Camisa");
    });

    expect(container.textContent).toContain("Lavado");
    expect(container.textContent).toContain("Mancha difícil");
  });

  it("debería cambiar el estado de un pedido", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPedidosRequest).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(container.textContent).toContain("Total registrados: 2");
    });

    const statusSelect = obtenerSelectEstadoPedido(container);

    expect(statusSelect).toBeDefined();

    fireEvent.change(statusSelect as HTMLSelectElement, {
      target: {
        value: "CONFIRMADO",
      },
    });

    await waitFor(() => {
      expect(updateEstadoPedidoRequest).toHaveBeenCalledWith(
        1,
        "CONFIRMADO",
        "token-admin",
      );
    });
  });

  it("debería enviar prendas y cantidades para un servicio por opción", async () => {
    const {container} = renderPage();

    await waitFor(() => expect(getServiciosBaseRequest).toHaveBeenCalled());

    const form = container.querySelector("form") as HTMLFormElement;
    const selects = Array.from(form.querySelectorAll("select"));
    const cliente = selects.find((select) =>
      Array.from(select.options).some((option) => option.value === "2" && option.text.includes("Cliente")),
    ) as HTMLSelectElement;
    const servicio = selects.find((select) =>
      select.options[0]?.text.includes("Servicio base") &&
      Array.from(select.options).some((option) => option.value === "3"),
    ) as HTMLSelectElement;

    fireEvent.change(cliente, {target: {value: "2"}});
    fireEvent.change(servicio, {target: {value: "3"}});

    const selectsActualizados = Array.from(form.querySelectorAll("select"));
    const opcion = selectsActualizados.find((select) =>
      Array.from(select.options).some((item) => item.value === "LARGA"),
    ) as HTMLSelectElement;
    const prenda = selectsActualizados.find((select) =>
      select.options[0]?.text.includes("Selecciona una prenda"),
    ) as HTMLSelectElement;

    fireEvent.change(opcion, {target: {value: "LARGA"}});
    fireEvent.change(prenda, {target: {value: "1"}});
    fireEvent.change(form.querySelector('input[type="number"]') as HTMLInputElement, {
      target: {value: "2"},
    });

    const fechas = Array.from(form.querySelectorAll('input[type="date"]'));
    fireEvent.change(fechas[0], {target: {value: "2026-06-21"}});
    fireEvent.change(fechas[1], {target: {value: "2026-06-22"}});
    fireEvent.submit(form);

    await waitFor(() => {
      expect(createPedidoRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          idServicioBase: 3,
          opcionBaseCodigo: "LARGA",
          detalles: [expect.objectContaining({idPrenda: 1, cantidad: 2})],
        }),
        "token-admin",
      );
    });
  });
});
