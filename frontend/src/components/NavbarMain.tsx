import logo from "../assets/imgs/lc-icon-border.png";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";

export default function NavbarMain() {
  const {isAuthenticated, logout} = useAuth();

  return (
    <header className="rounded-b-lg shadow-xl/30 fixed left-0 top-0 z-50 w-full bg-[#6B4F3E]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-15 w-15 object-contain" />
        </div>
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-8 text-sm md:flex">
            <li>
              <a href="#inicio" className="transition hover:text-[#F8EFD8]">
                Inicio
              </a>
            </li>
            <li>
              <a href="#servicios" className="transition hover:text-[#F8EFD8]">
                Servicios
              </a>
            </li>
            <li>
              <a href="#nosotros" className="transition hover:text-[#F8EFD8]">
                Nosotros
              </a>
            </li>
            <li>
              <a href="#contacto" className="transition hover:text-[#F8EFD8]">
                Contacto
              </a>
            </li>
          </ul>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/agendar"
                className="rounded-full bg-[#F8EFD8] px-5 py-2 text-sm font-semibold text-[#6B4F3E] shadow-md transition hover:bg-white"
              >
                Agendar ahora
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[#F8EFD8]/70 px-5 py-2 text-sm font-semibold text-[#F8EFD8] transition hover:bg-[#F8EFD8] hover:text-[#6B4F3E]"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-[#F8EFD8] px-5 py-2 text-sm font-semibold text-[#6B4F3E] shadow-md transition hover:bg-white"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
