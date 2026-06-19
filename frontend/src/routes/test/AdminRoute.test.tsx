import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import AdminRoute from "../AdminRoute";
import {useAuth} from "../../context/AuthContext";
import type {AuthUser} from "../../types/auth";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const usuarioClienteMock: AuthUser = {
  idUsuario: 1,
  nombres: "Benjamín",
  apPaterno: "Aranda",
  apMaterno: "Test",
  correo: "cliente@test.com",
  telefono: 999999999,
  rol: "CLIENTE",
};

const usuarioAdminMock: AuthUser = {
  idUsuario: 2,
  nombres: "Admin",
  apPaterno: "Lava",
  apMaterno: "Clean",
  correo: "admin@test.com",
  telefono: 888888888,
  rol: "ADMINISTRADOR",
};

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <h1>Panel Administrador</h1>
            </AdminRoute>
          }
        />

        <Route path="/login" element={<h1>Página Login</h1>} />

        <Route path="/" element={<h1>Página Inicio</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería redirigir a login si el usuario no está autenticado", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(await screen.findByText("Página Login")).toBeInTheDocument();
  });

  it("debería redirigir al inicio si el usuario autenticado no es administrador", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: usuarioClienteMock,
      token: "token-cliente",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(await screen.findByText("Página Inicio")).toBeInTheDocument();
  });

  it("debería mostrar el panel si el usuario es administrador", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: usuarioAdminMock,
      token: "token-admin",
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderAdminRoute();

    expect(await screen.findByText("Panel Administrador")).toBeInTheDocument();
  });
});
