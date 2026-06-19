import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import LoginPage from "../LoginPage";
import {loginRequest} from "../../api/authService";
import {useAuth} from "../../context/AuthContext";
import type {LoginResponse} from "../../types/auth";

const navigateMock = vi.hoisted(() => vi.fn());
const loginMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../api/authService", () => ({
  loginRequest: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../components/SuccessScreen", () => ({
  default: () => <div>Login exitoso</div>,
}));

const loginResponseClienteMock: LoginResponse = {
  token: "token-cliente",
  message: "Login exitoso",
  idUsuario: 1,
  nombres: "Benjamín",
  apPaterno: "Aranda",
  apMaterno: "Test",
  correo: "cliente@test.com",
  telefono: 999999999,
  rol: "CLIENTE",
};

const loginResponseAdminMock: LoginResponse = {
  token: "token-admin",
  message: "Login exitoso",
  idUsuario: 2,
  nombres: "Admin",
  apPaterno: "Lava",
  apMaterno: "Clean",
  correo: "admin@test.com",
  telefono: 888888888,
  rol: "ADMINISTRADOR",
};

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

function getLoginInputs(container: HTMLElement) {
  const correoInput = container.querySelector(
    'input[type="email"]',
  ) as HTMLInputElement;

  const contraseniaInput = container.querySelector(
    'input[type="password"]',
  ) as HTMLInputElement;

  return {
    correoInput,
    contraseniaInput,
  };
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: loginMock,
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("debería renderizar el formulario de login", () => {
    const {container} = renderLoginPage();

    const {correoInput, contraseniaInput} = getLoginInputs(container);

    expect(screen.getByText("Iniciar sesión en LavaClean")).toBeInTheDocument();

    expect(correoInput).toBeInTheDocument();

    expect(contraseniaInput).toBeInTheDocument();

    expect(
      screen.getByRole("button", {name: "Iniciar sesión"}),
    ).toBeInTheDocument();
  });

  it("debería iniciar sesión como cliente y redirigir al inicio", async () => {
    vi.mocked(loginRequest).mockResolvedValueOnce(loginResponseClienteMock);

    const {container} = renderLoginPage();

    const {correoInput, contraseniaInput} = getLoginInputs(container);

    fireEvent.change(correoInput, {
      target: {
        value: " cliente@test.com ",
      },
    });

    fireEvent.change(contraseniaInput, {
      target: {
        value: " password123 ",
      },
    });

    fireEvent.click(screen.getByRole("button", {name: "Iniciar sesión"}));

    await waitFor(() => {
      expect(loginRequest).toHaveBeenCalledWith({
        correo: "cliente@test.com",
        contrasenia: "password123",
      });
    });

    expect(await screen.findByText("Login exitoso")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(loginMock).toHaveBeenCalledWith(
          {
            idUsuario: loginResponseClienteMock.idUsuario,
            nombres: loginResponseClienteMock.nombres,
            apPaterno: loginResponseClienteMock.apPaterno,
            apMaterno: loginResponseClienteMock.apMaterno,
            correo: loginResponseClienteMock.correo,
            telefono: loginResponseClienteMock.telefono,
            rol: loginResponseClienteMock.rol,
          },
          loginResponseClienteMock.token,
        );
      },
      {
        timeout: 4000,
      },
    );

    expect(navigateMock).toHaveBeenCalledWith("/");
  }, 8000);

  it("debería iniciar sesión como administrador y redirigir al panel admin", async () => {
    vi.mocked(loginRequest).mockResolvedValueOnce(loginResponseAdminMock);

    const {container} = renderLoginPage();

    const {correoInput, contraseniaInput} = getLoginInputs(container);

    fireEvent.change(correoInput, {
      target: {
        value: "admin@test.com",
      },
    });

    fireEvent.change(contraseniaInput, {
      target: {
        value: "admin123",
      },
    });

    fireEvent.click(screen.getByRole("button", {name: "Iniciar sesión"}));

    await waitFor(() => {
      expect(loginRequest).toHaveBeenCalledWith({
        correo: "admin@test.com",
        contrasenia: "admin123",
      });
    });

    expect(await screen.findByText("Login exitoso")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(loginMock).toHaveBeenCalledWith(
          {
            idUsuario: loginResponseAdminMock.idUsuario,
            nombres: loginResponseAdminMock.nombres,
            apPaterno: loginResponseAdminMock.apPaterno,
            apMaterno: loginResponseAdminMock.apMaterno,
            correo: loginResponseAdminMock.correo,
            telefono: loginResponseAdminMock.telefono,
            rol: loginResponseAdminMock.rol,
          },
          loginResponseAdminMock.token,
        );
      },
      {
        timeout: 4000,
      },
    );

    expect(navigateMock).toHaveBeenCalledWith("/admin");
  }, 8000);

  it("debería mostrar error si las credenciales son incorrectas", async () => {
    vi.mocked(loginRequest).mockRejectedValueOnce(
      new Error("Credenciales incorrectas"),
    );

    const {container} = renderLoginPage();

    const {correoInput, contraseniaInput} = getLoginInputs(container);

    fireEvent.change(correoInput, {
      target: {
        value: "error@test.com",
      },
    });

    fireEvent.change(contraseniaInput, {
      target: {
        value: "wrongpassword",
      },
    });

    fireEvent.click(screen.getByRole("button", {name: "Iniciar sesión"}));

    expect(
      await screen.findByText("Correo o contraseña incorrectos."),
    ).toBeInTheDocument();

    expect(loginMock).not.toHaveBeenCalled();

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
