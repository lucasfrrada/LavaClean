import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AuthProvider, useAuth} from "../AuthContext";
import {isTokenExpired} from "../../utils/jwt";
import type {AuthUser} from "../../types/auth";

vi.mock("../../utils/jwt", () => ({
  isTokenExpired: vi.fn(() => false),
}));

const usuarioMock: AuthUser = {
  idUsuario: 1,
  nombres: "Benjamín",
  apPaterno: "Aranda",
  apMaterno: "Test",
  correo: "benja@test.com",
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

function TestComponent() {
  const {user, token, isAuthenticated, login, logout, updateUser} = useAuth();

  return (
    <div>
      <p data-testid="auth-status">
        {isAuthenticated ? "autenticado" : "no autenticado"}
      </p>

      <p data-testid="user-name">{user?.nombres ?? "sin usuario"}</p>

      <p data-testid="user-role">{user?.rol ?? "sin rol"}</p>

      <p data-testid="token">{token ?? "sin token"}</p>

      <button onClick={() => login(usuarioMock, "token-test")}>Login</button>

      <button onClick={() => login(usuarioAdminMock, "token-admin")}>
        Login Admin
      </button>

      <button
        onClick={() =>
          updateUser({
            ...usuarioMock,
            nombres: "Benjamín Actualizado",
          })
        }
      >
        Actualizar Usuario
      </button>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(isTokenExpired).mockReturnValue(false);
  });

  it("debería iniciar sin usuario autenticado si no hay datos en localStorage", () => {
    renderAuthProvider();

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "no autenticado",
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent("sin usuario");

    expect(screen.getByTestId("token")).toHaveTextContent("sin token");
  });

  it("debería guardar usuario y token al hacer login", async () => {
    renderAuthProvider();

    await userEvent.click(screen.getByRole("button", {name: "Login"}));

    expect(screen.getByTestId("auth-status")).toHaveTextContent("autenticado");

    expect(screen.getByTestId("user-name")).toHaveTextContent("Benjamín");

    expect(screen.getByTestId("token")).toHaveTextContent("token-test");

    expect(localStorage.getItem("authToken")).toBe("token-test");

    expect(JSON.parse(localStorage.getItem("authUser") ?? "{}")).toEqual(
      usuarioMock,
    );
  });

  it("debería limpiar usuario y token al hacer logout", async () => {
    renderAuthProvider();

    await userEvent.click(screen.getByRole("button", {name: "Login"}));

    await userEvent.click(screen.getByRole("button", {name: "Logout"}));

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "no autenticado",
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent("sin usuario");

    expect(screen.getByTestId("token")).toHaveTextContent("sin token");

    expect(localStorage.getItem("authUser")).toBeNull();

    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("debería actualizar los datos del usuario", async () => {
    renderAuthProvider();

    await userEvent.click(screen.getByRole("button", {name: "Login"}));

    await userEvent.click(
      screen.getByRole("button", {name: "Actualizar Usuario"}),
    );

    expect(screen.getByTestId("user-name")).toHaveTextContent(
      "Benjamín Actualizado",
    );

    expect(JSON.parse(localStorage.getItem("authUser") ?? "{}").nombres).toBe(
      "Benjamín Actualizado",
    );
  });

  it("debería cargar usuario y token desde localStorage si el token es válido", async () => {
    localStorage.setItem("authUser", JSON.stringify(usuarioAdminMock));
    localStorage.setItem("authToken", "token-admin");

    vi.mocked(isTokenExpired).mockReturnValue(false);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "autenticado",
      );
    });

    expect(screen.getByTestId("user-name")).toHaveTextContent("Admin");

    expect(screen.getByTestId("user-role")).toHaveTextContent("ADMINISTRADOR");

    expect(screen.getByTestId("token")).toHaveTextContent("token-admin");
  });

  it("debería limpiar localStorage si el token está expirado", async () => {
    localStorage.setItem("authUser", JSON.stringify(usuarioMock));
    localStorage.setItem("authToken", "token-expirado");

    vi.mocked(isTokenExpired).mockReturnValue(true);

    renderAuthProvider();

    await waitFor(() => {
      expect(localStorage.getItem("authUser")).toBeNull();
    });

    expect(localStorage.getItem("authToken")).toBeNull();

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "no autenticado",
    );
  });

  it("debería limpiar localStorage si authUser tiene JSON inválido", async () => {
    localStorage.setItem("authUser", "json-invalido");
    localStorage.setItem("authToken", "token-test");

    vi.mocked(isTokenExpired).mockReturnValue(false);

    renderAuthProvider();

    await waitFor(() => {
      expect(localStorage.getItem("authUser")).toBeNull();
    });

    expect(localStorage.getItem("authToken")).toBeNull();

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "no autenticado",
    );
  });
});
