import {
  LayoutDashboard,
  ClipboardList,
  Users,
  LogOut,
  ArrowLeft,
  Shirt,
  WashingMachine,
  Package,
} from "lucide-react";
import {Link, NavLink, Outlet, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import logo from "../assets/imgs/lavaclean-icon.png";
import PageTransition from "../components/PageTransition";
import {AnimatePresence} from "motion/react";

const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    path: "/admin/pedidos",
    icon: ClipboardList,
  },
  {
    label: "Clientes",
    path: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Servicios",
    path: "/admin/servicios",
    icon: WashingMachine,
  },
  {
    label: "Prendas",
    path: "/admin/prendas",
    icon: Shirt,
  },

  {
    label: "Inventario",
    path: "/admin/inventario",
    icon: Package,
  },
];

export default function AdminLayout() {
  const {logout, user} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <main className="flex min-h-screen w-full bg-[#FFFFFF] text-[#111827]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-[#DBEAFE] bg-white text-[#111827] shadow-xl lg:flex">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-[#DBEAFE] px-6">
          <img
            src={logo}
            alt="Logo LavaClean"
            className="h-12 w-12 object-contain"
          />

          <div>
            <h1 className="text-lg font-bold">LavaClean</h1>
            <p className="text-xs text-[#64748B]">Panel administrador</p>
          </div>
        </div>

        {/* Perfil admin */}
        <div className="border-b border-[#DBEAFE] px-6 py-5">
          <p className="text-sm font-bold">
            {user?.nombres || "Administrador"}
          </p>
          <p className="mt-1 truncate text-xs text-[#64748B]">
            {user?.correo || "admin@lavaclean.com"}
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {adminLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({isActive}) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md"
                      : "text-[#111827] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Acciones inferiores */}
        <div className="space-y-2 border-t border-[#DBEAFE] px-4 py-5">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          >
            <ArrowLeft size={18} />
            Volver al sitio
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <section className="min-h-screen w-full lg:pl-72">
        {/* Header móvil / superior */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-[#DBEAFE] bg-white px-6 text-[#111827] shadow-md lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo LavaClean"
              className="h-10 w-10 object-contain"
            />
            <span className="font-bold transition hover:text-[#2563EB]">
              LavaClean Admin
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-sm font-bold text-[#111827] transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          >
            Salir
          </button>
        </header>

        <div className="px-6 py-8 lg:px-10">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
