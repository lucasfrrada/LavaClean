import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import AdminInventarioPage from "../AdminInventarioPage";
import {useAuth} from "../../../context/AuthContext";
import {
  createMovimientoRequest,
  createProductoRequest,
  deleteProductoRequest,
  getMovimientosRequest,
  getProductosRequest,
} from "../../../api/inventarioService";
import type {MovimientoInventario, Producto} from "../../../types/inventario";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/inventarioService", () => ({
  createMovimientoRequest: vi.fn(),
  createProductoRequest: vi.fn(),
  deleteProductoRequest: vi.fn(),
  getMovimientosRequest: vi.fn(),
  getProductosRequest: vi.fn(),
}));

const productosMock: Producto[] = [
  {
    idProducto: 1,
    nombreProducto: "Detergente",
    descripcion: "Para lavado",
    stock: 10,
    stockMinimo: 3,
    unidadMedida: "LITROS",
    estado: "ACTIVO",
  },
  {
    idProducto: 2,
    nombreProducto: "Suavizante",
    descripcion: "Aroma floral",
    stock: 2,
    stockMinimo: 5,
    unidadMedida: "LITROS",
    estado: "BAJO_STOCK",
  },
];

const movimientosMock: MovimientoInventario[] = [
  {
    idMovimiento: 1,
    idProducto: 1,
    nombreProducto: "Detergente",
    tipoMovimiento: "ENTRADA",
    cantidad: 5,
    stockAnterior: 5,
    stockNuevo: 10,
    fechaMovimiento: "2026-07-13",
    motivo: "Compra",
  },
];

function renderAdminInventarioPage() {
  return render(<AdminInventarioPage />);
}

async function waitForInventarioLoaded() {
  await screen.findAllByText("Detergente");
}

describe("AdminInventarioPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: "token-admin",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(getProductosRequest).mockResolvedValue(productosMock);
    vi.mocked(getMovimientosRequest).mockResolvedValue(movimientosMock);
    vi.mocked(createProductoRequest).mockResolvedValue(productosMock[0]);
    vi.mocked(createMovimientoRequest).mockResolvedValue(movimientosMock[0]);
    vi.mocked(deleteProductoRequest).mockResolvedValue(undefined);
  });

  it("debería cargar y mostrar el inventario", async () => {
    renderAdminInventarioPage();

    expect(await screen.findAllByText("Detergente")).toHaveLength(2);
    expect(screen.getAllByText("Suavizante")).toHaveLength(2);
    expect(screen.getByText("Productos registrados")).toBeInTheDocument();
    expect(screen.getByText("Bajo stock / agotados")).toBeInTheDocument();
    expect(screen.getByText("Movimientos")).toBeInTheDocument();

    expect(getProductosRequest).toHaveBeenCalledWith("token-admin");
    expect(getMovimientosRequest).toHaveBeenCalledWith("token-admin");
  });

  it("debería crear un producto y recargar el inventario", async () => {
    renderAdminInventarioPage();

    await waitForInventarioLoaded();

    fireEvent.change(screen.getByPlaceholderText("Nombre producto"), {
      target: {value: "  Cloro  "},
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: {value: "  Desinfectante  "},
    });
    fireEvent.change(screen.getByPlaceholderText("Ej: 10"), {
      target: {value: "12"},
    });
    fireEvent.change(screen.getByPlaceholderText("Ej: 3"), {
      target: {value: "4"},
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona una unidad"), {
      target: {value: "LITROS"},
    });

    fireEvent.click(screen.getByRole("button", {name: "Crear producto"}));

    await waitFor(() => {
      expect(createProductoRequest).toHaveBeenCalledWith(
        {
          nombreProducto: "Cloro",
          descripcion: "Desinfectante",
          stock: 12,
          stockMinimo: 4,
          unidadMedida: "LITROS",
        },
        "token-admin",
      );
    });

    expect(getProductosRequest).toHaveBeenCalledTimes(2);
  });

  it("debería validar que se seleccione un producto antes de crear movimiento", async () => {
    renderAdminInventarioPage();

    await waitForInventarioLoaded();

    const movimientoForm = screen
      .getByRole("button", {name: "Registrar"})
      .closest("form");

    if (!movimientoForm) {
      throw new Error("Formulario de movimiento no encontrado");
    }

    fireEvent.submit(movimientoForm);

    expect(
      screen.getByText("Debes seleccionar un producto."),
    ).toBeInTheDocument();
    expect(createMovimientoRequest).not.toHaveBeenCalled();
  });

  it("debería registrar un movimiento de inventario", async () => {
    renderAdminInventarioPage();

    await waitForInventarioLoaded();

    fireEvent.change(screen.getByDisplayValue("Seleccionar producto"), {
      target: {value: "1"},
    });
    fireEvent.change(screen.getByDisplayValue("Entrada"), {
      target: {value: "SALIDA"},
    });
    fireEvent.change(screen.getByDisplayValue("1"), {
      target: {value: "2"},
    });
    fireEvent.change(screen.getByPlaceholderText("Motivo del movimiento"), {
      target: {value: "  Uso diario  "},
    });

    fireEvent.click(screen.getByRole("button", {name: "Registrar"}));

    await waitFor(() => {
      expect(createMovimientoRequest).toHaveBeenCalledWith(
        {
          idProducto: 1,
          tipoMovimiento: "SALIDA",
          cantidad: 2,
          motivo: "Uso diario",
        },
        "token-admin",
      );
    });
  });

  it("debería eliminar un producto confirmado desde el modal", async () => {
    renderAdminInventarioPage();

    await waitForInventarioLoaded();

    fireEvent.click(screen.getAllByRole("button", {name: "Eliminar"})[0]);

    const modal = screen.getByText("¿Eliminar producto?").closest("div");

    if (!modal) {
      throw new Error("Modal de eliminación no encontrado");
    }

    expect(screen.getByText(/Esta acción eliminará/)).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole("button", {name: "Eliminar"}));

    await waitFor(() => {
      expect(deleteProductoRequest).toHaveBeenCalledWith(1, "token-admin");
    });
  });
});
