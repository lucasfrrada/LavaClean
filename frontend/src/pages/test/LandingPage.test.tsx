import {act} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {render} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import LandingPage from "../LandingPage";
import {useAuth} from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debería renderizar la landing page principal", () => {
    const {container} = renderPage();

    expect(container.querySelector("section")).toBeInTheDocument();
    expect(container.textContent?.length ?? 0).toBeGreaterThan(20);
  });

  it("debería mostrar acciones o enlaces principales de navegación", () => {
    const {container} = renderPage();

    const actions = container.querySelectorAll("a, button");

    expect(actions.length).toBeGreaterThan(0);
  });

  it("debería mantener estable el carrusel al avanzar el tiempo", () => {
    vi.useFakeTimers();

    const {container, unmount} = renderPage();

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(container.querySelector("section")).toBeInTheDocument();

    unmount();
  });
});
