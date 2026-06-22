import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ClipboardList,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/imgs/lavaclean-icon.png";

export default function NavbarMain() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#DBEAFE] bg-white/95 shadow-md backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo LavaClean"
            className="h-12 w-12 object-contain"
          />

          <span className="text-xl font-bold text-[#111827] transition hover:text-[#2563EB]">
            MagdaClean
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          <ul className="hidden items-center gap-8 text-sm font-medium text-[#111827] md:flex">
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 transition hover:text-[#2563EB]"
              >
                <span>Inicio</span>
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className="flex items-center gap-2 transition hover:text-[#2563EB]"
              >
                <span>Servicios</span>
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className="flex items-center gap-2 transition hover:text-[#2563EB]"
              >
                <span>Nosotros</span>
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className="flex items-center gap-2 transition hover:text-[#2563EB]"
              >
                <span>Contacto</span>
              </Link>
            </li>
          </ul>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full border border-[#BFDBFE] bg-white px-5 py-2 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
            >
              Iniciar sesión
            </Link>
          ) : (
            <div className="relative flex items-center gap-4">
              {user?.rol === "ADMINISTRADOR" ? (
                <Link
                  to="/admin/pedidos"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#111827] transition hover:text-[#2563EB]"
                >
                  <ShieldCheck size={17} />
                  Panel administrador
                </Link>
              ) : (
                <Link
                  to="/agendar"
                  className="rounded-full border border-[#BFDBFE] bg-white px-5 py-2 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                >
                  Agendar ahora
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BFDBFE] bg-white text-[#111827] shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                <User size={20} />
              </button>

              {/* Dropdown perfil */}
              {isProfileOpen && (
                <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#DBEAFE]">
                  <div className="border-b border-[#DBEAFE] px-4 py-4">
                    <p className="text-sm font-bold text-[#111827]">
                      {user?.nombres || "Usuario LavaClean"}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#64748B]">
                      {user?.correo || "cliente@lavaclean.com"}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/mis-datos"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                    >
                      <Settings size={17} />
                      Mis datos
                    </Link>

                    <Link
                      to="/mis-pedidos"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
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
