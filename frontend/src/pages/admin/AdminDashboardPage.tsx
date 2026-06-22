import {useEffect, useMemo, useState} from "react";
import {
  ClipboardList,
  DollarSign,
  Shirt,
  Users,
  RefreshCcw,
} from "lucide-react";

import {useAuth} from "../../context/AuthContext";
import {getPedidosRequest} from "../../api/pedidoService";
import {getUsuariosRequest} from "../../api/usuarioService";
import {getServiciosRequest} from "../../api/servicioService";

import type {Pedido, Servicio} from "../../types/pedido";
import type {AuthUser} from "../../types/auth";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

function isCurrentMonth(dateValue?: string) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function AdminDashboardPage() {
  const {token} = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<AuthUser[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [pedidosData, clientesData, serviciosData] = await Promise.all([
        getPedidosRequest(token),
        getUsuariosRequest(token),
        getServiciosRequest(token),
      ]);

      setPedidos(pedidosData);
      setClientes(clientesData);
      setServicios(serviciosData);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar los datos del dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const pedidosActivos = useMemo(() => {
    return pedidos.filter(
      (pedido) =>
        pedido.estado === "REVISION" || pedido.estado === "EN_PROCESO",
    ).length;
  }, [pedidos]);

  const clientesRegistrados = useMemo(() => {
    return clientes.filter((cliente) => cliente.rol === "CLIENTE").length;
  }, [clientes]);

  const serviciosDisponibles = servicios.length;

  const ingresosMes = useMemo(() => {
    return pedidos
      .filter((pedido) => pedido.estado === "PAGADO")
      .filter((pedido) =>
        isCurrentMonth(pedido.fechaEntrega || pedido.fechaLlegada),
      )
      .reduce((total, pedido) => total + Number(pedido.total ?? 0), 0);
  }, [pedidos]);

  const pedidosRecientes = useMemo(() => {
    return [...pedidos]
      .sort((a, b) => Number(b.idPedido) - Number(a.idPedido))
      .slice(0, 5);
  }, [pedidos]);

  const getClienteNombre = (idUsuario: number) => {
    const cliente = clientes.find((item) => item.idUsuario === idUsuario) as
      | {
          idUsuario: number;
          nombreCompleto?: string;
          nombres?: string;
          apPaterno?: string;
          correo?: string;
        }
      | undefined;

    if (!cliente) return `Usuario #${idUsuario}`;

    return (
      cliente.nombreCompleto ||
      `${cliente.nombres ?? ""} ${cliente.apPaterno ?? ""}`.trim() ||
      `Usuario #${idUsuario}`
    );
  };

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">
            Dashboard administrativo
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Resumen general de la operación de LavaClean.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#111827] shadow-md transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={17} />
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-6 rounded-xl bg-red-100 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Pedidos activos"
          value={String(pedidosActivos)}
          icon={ClipboardList}
        />

        <DashboardCard
          title="Clientes registrados"
          value={String(clientesRegistrados)}
          icon={Users}
        />

        <DashboardCard
          title="Servicios disponibles"
          value={String(serviciosDisponibles)}
          icon={Shirt}
        />

        <DashboardCard
          title="Ingresos del mes"
          value={formatCurrency(ingresosMes)}
          icon={DollarSign}
        />
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              Pedidos recientes
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Últimos pedidos registrados en el sistema.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-6 rounded-2xl bg-[#EFF6FF] p-5 text-sm text-[#64748B]">
            Cargando información...
          </p>
        ) : pedidosRecientes.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-[#EFF6FF] p-5 text-sm text-[#64748B]">
            No hay pedidos registrados todavía.
          </p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#DBEAFE]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFFFF] text-[#111827]">
                <tr>
                  <th className="px-5 py-4">Pedido</th>
                  <th className="px-5 py-4">Usuario</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Fecha llegada</th>
                  <th className="px-5 py-4">Fecha entrega</th>
                  <th className="px-5 py-4">Total</th>
                </tr>
              </thead>

              <tbody>
                {pedidosRecientes.map((pedido) => (
                  <tr
                    key={pedido.idPedido}
                    className="border-t border-[#DBEAFE] transition hover:bg-[#EFF6FF]"
                  >
                    <td className="px-5 py-4 font-bold">#{pedido.idPedido}</td>

                    <td className="px-5 py-4">
                      {getClienteNombre(pedido.idUsuario)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getEstadoClass(
                          pedido.estado,
                        )}`}
                      >
                        {getEstadoLabel(pedido.estado)}
                      </span>
                    </td>

                    <td className="px-5 py-4">{pedido.fechaLlegada || "-"}</td>

                    <td className="px-5 py-4">{pedido.fechaEntrega || "-"}</td>

                    <td className="px-5 py-4 font-bold">
                      {formatCurrency(Number(pedido.total ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
};

function DashboardCard({title, value, icon: Icon}: DashboardCardProps) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#64748B]">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-[#111827]">{value}</h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFFFF] text-[#111827]">
          <Icon size={25} />
        </div>
      </div>
    </article>
  );
}

function getEstadoLabel(estado: string) {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
  };

  return labels[estado] ?? estado;
}

function getEstadoClass(estado: string) {
  const classes: Record<string, string> = {
    PENDIENTE: "bg-sky-100 text-sky-700",
    EN_PROCESO: "bg-cyan-100 text-cyan-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-blue-100 text-blue-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return classes[estado] ?? "bg-gray-100 text-gray-700";
}
