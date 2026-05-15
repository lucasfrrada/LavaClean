import {ArrowLeft, ClipboardList, Search} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

type OrderStatus = "EN_PROCESO" | "COMPLETADO" | "PAGADO" | "CANCELADO";

type Order = {
  id: number;
  cliente: string;
  telefono: string;
  servicio: string;
  prenda: string;
  cantidad: number;
  fecha: string;
  estado: OrderStatus;
  total: number;
};

const orders: Order[] = [
  {
    id: 1001,
    cliente: "Juan Pérez",
    telefono: "+56 9 1234 5678",
    servicio: "Lavado y planchado",
    prenda: "Ropa diaria",
    cantidad: 8,
    fecha: "2026-05-14",
    estado: "EN_PROCESO",
    total: 12990,
  },
  {
    id: 1002,
    cliente: "María González",
    telefono: "+56 9 8765 4321",
    servicio: "Tintorería",
    prenda: "Trajes / prendas formales",
    cantidad: 2,
    fecha: "2026-05-13",
    estado: "COMPLETADO",
    total: 18990,
  },
  {
    id: 1003,
    cliente: "Camila Torres",
    telefono: "+56 9 2222 3333",
    servicio: "Servicio express",
    prenda: "Ropa delicada",
    cantidad: 4,
    fecha: "2026-05-12",
    estado: "PAGADO",
    total: 15990,
  },
  {
    id: 1004,
    cliente: "Felipe Rojas",
    telefono: "+56 9 4444 5555",
    servicio: "Lavado",
    prenda: "Ropa de cama",
    cantidad: 3,
    fecha: "2026-05-11",
    estado: "CANCELADO",
    total: 9990,
  },
];

const statusOptions: {label: string; value: OrderStatus | "TODOS"}[] = [
  {label: "Todos", value: "TODOS"},
  {label: "En proceso", value: "EN_PROCESO"},
  {label: "Completado", value: "COMPLETADO"},
  {label: "Pagado", value: "PAGADO"},
  {label: "Cancelado", value: "CANCELADO"},
];

function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
  };

  return labels[status];
}

function getStatusClass(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    EN_PROCESO: "bg-yellow-100 text-yellow-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return styles[status];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-[#F5EEDC] text-[#6B4F3E]">
      {/* Navbar */}

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-6">
        {/* Título */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8] shadow-md">
            <ClipboardList size={28} />
          </div>

          <h1 className="mt-5 text-4xl font-bold">Panel de pedidos</h1>

          <p className="mt-3 text-sm text-[#9A7C5F]">
            Administra y revisa el estado de los servicios agendados
          </p>
        </div>

        {/* Resumen */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="En proceso"
            value={
              orders.filter((order) => order.estado === "EN_PROCESO").length
            }
          />
          <SummaryCard
            title="Completados"
            value={
              orders.filter((order) => order.estado === "COMPLETADO").length
            }
          />
          <SummaryCard
            title="Pagados"
            value={orders.filter((order) => order.estado === "PAGADO").length}
          />
          <SummaryCard
            title="Cancelados"
            value={
              orders.filter((order) => order.estado === "CANCELADO").length
            }
          />
        </div>

        {/* Contenedor principal */}
        <section className="rounded-3xl bg-white p-6 shadow-2xl">
          {/* Filtros */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#6B4F3E]">
                Listado de pedidos
              </h2>
              <p className="mt-1 text-sm text-[#9A7C5F]">
                Visualiza pedidos por cliente, servicio y estado.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A7C5F]"
                />
                <input
                  type="text"
                  placeholder="Buscar pedido..."
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 sm:w-64"
                />
              </div>

              <select className="rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#E5D8C5] md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                <tr>
                  <th className="px-5 py-4 font-bold">Pedido</th>
                  <th className="px-5 py-4 font-bold">Cliente</th>
                  <th className="px-5 py-4 font-bold">Servicio</th>
                  <th className="px-5 py-4 font-bold">Cantidad</th>
                  <th className="px-5 py-4 font-bold">Fecha</th>
                  <th className="px-5 py-4 font-bold">Total</th>
                  <th className="px-5 py-4 font-bold">Estado</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-[#E5D8C5] transition hover:bg-[#F8F5EE]"
                  >
                    <td className="px-5 py-4 font-bold">#{order.id}</td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{order.cliente}</p>
                      <p className="mt-1 text-xs text-[#9A7C5F]">
                        {order.telefono}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{order.servicio}</p>
                      <p className="mt-1 text-xs text-[#9A7C5F]">
                        {order.prenda}
                      </p>
                    </td>

                    <td className="px-5 py-4">{order.cantidad}</td>

                    <td className="px-5 py-4">{order.fecha}</td>

                    <td className="px-5 py-4 font-bold">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          order.estado,
                        )}`}
                      >
                        {getStatusLabel(order.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="space-y-4 md:hidden">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#E5D8C5] bg-[#F8F5EE] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">Pedido #{order.id}</h3>
                    <p className="mt-1 text-sm text-[#9A7C5F]">
                      {order.cliente}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                      order.estado,
                    )}`}
                  >
                    {getStatusLabel(order.estado)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <strong>Servicio:</strong> {order.servicio}
                  </p>
                  <p>
                    <strong>Prenda:</strong> {order.prenda}
                  </p>
                  <p>
                    <strong>Cantidad:</strong> {order.cantidad}
                  </p>
                  <p>
                    <strong>Total:</strong> {formatCurrency(order.total)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
};

function SummaryCard({title, value}: SummaryCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 text-center shadow-md">
      <p className="text-sm font-semibold text-[#9A7C5F]">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-[#6B4F3E]">{value}</h3>
    </article>
  );
}
