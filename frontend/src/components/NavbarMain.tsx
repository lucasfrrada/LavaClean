import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {User, ClipboardList, LogOut, Settings} from "lucide-react";
import {useAuth} from "../context/AuthContext";
import logo from "../assets/imgs/lavaclean-icon.png";

export default function NavbarMain() {
  const {isAuthenticated, logout, user} = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="shadow-xl/30 fixed left-0 top-0 z-50 w-full bg-[#6B4F3E]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo LavaClean"
            className="h-12 w-12 object-contain"
          />

          <span className="text-xl font-bold text-white">LavaClean</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <ul className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
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

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full bg-[#F8EFD8] px-5 py-2 text-sm font-semibold text-[#6B4F3E] shadow-md transition hover:bg-white"
            >
              Iniciar sesión
            </Link>
          ) : (
            <div className="relative flex items-center gap-4">
              <Link
                to="/agendar"
                className="rounded-full bg-[#F8EFD8] px-5 py-2 text-sm font-semibold text-[#6B4F3E] shadow-md transition hover:bg-white"
              >
                Agendar ahora
              </Link>

              {/* Botón perfil */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F8EFD8]/60 bg-[#5A4334] text-[#F8EFD8] shadow-md transition hover:bg-[#F8EFD8] hover:text-[#6B4F3E]"
              >
                <User size={20} />
              </button>

              {/* Dropdown perfil */}
              {isProfileOpen && (
                <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl bg-[#241E1A] shadow-2xl ring-1 ring-white/10">
                  <div className="border-b border-white/10 px-4 py-4">
                    <p className="text-sm font-bold text-white">
                      {user?.nombre || "Usuario LavaClean"}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/50">
                      {user?.email || "cliente@lavaclean.com"}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/mis-datos"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#E7D9C2] transition hover:bg-white/10 hover:text-white"
                    >
                      <Settings size={17} />
                      Mis datos
                    </Link>

                    <Link
                      to="/mis-pedidos"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#E7D9C2] transition hover:bg-white/10 hover:text-white"
                    >
                      <ClipboardList size={17} />
                      Mis pedidos
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                    >
                      <LogOut size={17} />
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
