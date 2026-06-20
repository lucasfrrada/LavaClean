import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import AdminPrendasPage from "../AdminPrendasPage";
import {useAuth} from "../../../context/AuthContext";
import {
  getPrendasRequest,
  createPrendaRequest,
  updatePrendaRequest,
  deletePrendaRequest,
} from "../../../api/prendaService";
import type {AuthUser} from "../../../types/auth";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../api/prendaService", () => ({
  getPrendasRequest: vi.fn(),
  createPrendaRequest: vi.fn(),
  updatePrendaRequest: vi.fn(),
  deletePrendaRequest: vi.fn(),
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

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminPrendasPage />
    </MemoryRouter>,
  );
}

describe("AdminPrendasPage", () => {
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

    vi.mocked(getPrendasRequest).mockResolvedValue(prendasMock as never);
    vi.mocked(createPrendaRequest).mockResolvedValue(prendasMock[0] as never);
    vi.mocked(updatePrendaRequest).mockResolvedValue(prendasMock[1] as never);
    vi.mocked(deletePrendaRequest).mockResolvedValue(null as never);
  });

  it("debería cargar y mostrar las prendas", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPrendasRequest).toHaveBeenCalledWith("token-admin");
    });

    expect(container.textContent).toContain("Camisa");
    expect(container.textContent).toContain("Chaqueta");
    expect(container.textContent).toContain("Ropa");
    expect(container.textContent).toContain("Abrigo");
  });

  it("debería crear una nueva prenda desde el formulario si existe", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPrendasRequest).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll("input");

    expect(inputs.length).toBeGreaterThanOrEqual(2);

    fireEvent.change(inputs[0], {
      target: {
        value: "Pantalón",
      },
    });

    fireEvent.change(inputs[1], {
      target: {
        value: "Ropa",
      },
    });

    const submitButton = Array.from(container.querySelectorAll("button")).find(
      (button) => /crear|agregar|guardar/i.test(button.textContent ?? ""),
    );

    expect(submitButton).toBeDefined();

    fireEvent.click(submitButton as HTMLButtonElement);

    await waitFor(() => {
      expect(createPrendaRequest).toHaveBeenCalled();
    });
  });

  it("debería eliminar una prenda si existe botón de eliminar", async () => {
    const {container} = renderPage();

    await waitFor(() => {
      expect(getPrendasRequest).toHaveBeenCalled();
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
      expect(deletePrendaRequest).toHaveBeenCalled();
    });
  });
});
