import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import RegisterPage from "../RegisterPage";
import {registerRequest} from "../../api/usuarioService";

const navigateMock = vi.hoisted(() => vi.fn());

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

vi.mock("../../api/usuarioService", () => ({
  registerRequest: vi.fn(),
}));

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

function fillRegisterForm() {
  fireEvent.change(screen.getByPlaceholderText("Nombres"), {
    target: {value: "  Benjamín  "},
  });
  fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), {
    target: {value: "  Aranda  "},
  });
  fireEvent.change(screen.getByPlaceholderText("Apellido materno"), {
    target: {value: "  Test  "},
  });
  fireEvent.change(screen.getByPlaceholderText("Correo electrónico"), {
    target: {value: "  cliente@test.com  "},
  });
  fireEvent.change(screen.getByPlaceholderText("Número de teléfono"), {
    target: {value: "999999999"},
  });
  fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
    target: {value: "password123"},
  });
  fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
    target: {value: "password123"},
  });
}

function submitRegisterForm() {
  const form = screen
    .getByRole("button", {name: "Crear cuenta"})
    .closest("form");

  if (!form) {
    throw new Error("Formulario de registro no encontrado");
  }

  fireEvent.submit(form);
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("debería renderizar el formulario de registro", () => {
    renderRegisterPage();

    expect(screen.getByText("Crear tu cuenta de LavaClean")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombres")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Correo electrónico"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: "Crear cuenta"}),
    ).toBeInTheDocument();
  });

  it("debería mostrar error si las contraseñas no coinciden", () => {
    renderRegisterPage();

    fillRegisterForm();
    fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
      target: {value: "otraPassword"},
    });

    submitRegisterForm();

    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(registerRequest).not.toHaveBeenCalled();
  });

  it("debería mostrar error si la contraseña es demasiado corta", () => {
    renderRegisterPage();

    fillRegisterForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: {value: "short"},
    });
    fireEvent.change(screen.getByPlaceholderText("Confirmar contraseña"), {
      target: {value: "short"},
    });

    submitRegisterForm();

    expect(
      screen.getByText("La contraseña debe tener al menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(registerRequest).not.toHaveBeenCalled();
  });

  it("debería registrar un cliente y redirigir al login", async () => {
    vi.mocked(registerRequest).mockResolvedValueOnce({
      idUsuario: 1,
      nombres: "Benjamín",
      apPaterno: "Aranda",
      apMaterno: "Test",
      correo: "cliente@test.com",
      telefono: 999999999,
      rol: "CLIENTE",
    });

    renderRegisterPage();
    fillRegisterForm();
    submitRegisterForm();

    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalledWith({
        nombres: "Benjamín",
        apPaterno: "Aranda",
        apMaterno: "Test",
        correo: "cliente@test.com",
        telefono: 999999999,
        contrasenia: "password123",
        rol: "CLIENTE",
      });
    });

    expect(
      await screen.findByText(
        "Cuenta creada correctamente. Redirigiendo al login...",
      ),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(navigateMock).toHaveBeenCalledWith("/login");
      },
      {
        timeout: 1500,
      },
    );
  }, 3000);

  it("debería mostrar error si el registro falla", async () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.mocked(registerRequest).mockRejectedValueOnce(
      new Error("Correo ya registrado"),
    );

    renderRegisterPage();
    fillRegisterForm();
    submitRegisterForm();

    expect(
      await screen.findByText(
        "No se pudo crear la cuenta. Verifica los datos ingresados.",
      ),
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();

    consoleErrorMock.mockRestore();
  });
});
