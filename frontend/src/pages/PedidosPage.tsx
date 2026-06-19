import {useEffect, useMemo, useState} from "react";
import {ArrowLeft, ClipboardList, RefreshCcw} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

import {useAuth} from "../context/AuthContext";
import {getPedidosRequest} from "../api/pedidoService";
import type {EstadoPedido, Pedido} from "../types/pedido";
import NavbarMain from "../components/NavbarMain";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

function getEstadoLabel(estado: EstadoPedido) {
  const labels: Record<EstadoPedido, string> = {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
  };

  return labels[estado] ?? estado;
}

function getEstadoClass(estado: EstadoPedido) {
  const classes: Record<EstadoPedido, string> = {
    PENDIENTE: "bg-orange-100 text-orange-700",
    EN_PROCESO: "bg-yellow-100 text-yellow-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    PAGADO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return classes[estado] ?? "bg-gray-100 text-gray-700";
}

export default function PedidosPage() {
  const navigate = useNavigate();
  const {token, user} = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPedidos = async () => {
    if (!token || !user) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getPedidosRequest(token);

      const misPedidos = data.filter(
        (pedido) => pedido.idUsuario === user.idUsuario,
      );

      setPedidos(misPedidos);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar tus pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, [token, user]);

  const pedidosOrdenados = useMemo(() => {
    return [...pedidos].sort((a, b) => b.idPedido - a.idPedido);
  }, [pedidos]);

  return (
    <main className="min-h-screen w-full bg-[#F5EEDC] text-[#6B4F3E]">
      <header className="fixed left-0 top-0 z-50 w-full bg-[#6B4F3E] shadow-md">
        <NavbarMain />
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-32">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B4F3E] text-[#F8EFD8]">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-[#6B4F3E]">
                  Mis pedidos
                </h1>

                <p className="mt-1 text-sm text-[#9A7C5F]">
                  Revisa el estado y detalle de tus servicios agendados.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadPedidos}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#6B4F3E] shadow-md transition hover:bg-[#F8F5EE] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={17} />
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {errorMessage && (
          <p className="mb-6 rounded-xl bg-red-100 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        {isLoading ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-semibold text-[#9A7C5F]">
              Cargando tus pedidos...
            </p>
          </section>
        ) : pedidosOrdenados.length === 0 ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-[#6B4F3E]">
              Aún no tienes pedidos
            </h2>

            <p className="mt-3 text-sm text-[#9A7C5F]">
              Cuando agendes un servicio, aparecerá en esta sección.
            </p>

            <Link
              to="/agendar"
              className="mt-6 inline-flex rounded-full bg-[#6B4F3E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334]"
            >
              Agendar servicio
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {pedidosOrdenados.map((pedido) => (
              <article
                key={pedido.idPedido}
                className="rounded-3xl border border-[#E5D8C5] bg-white p-6 shadow-xl"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#6B4F3E]">
                      Pedido #{pedido.idPedido}
                    </h2>

                    <p className="mt-2 text-sm text-[#8A7161]">
                      Llegada: {pedido.fechaLlegada || "-"} · Entrega:{" "}
                      {pedido.fechaEntrega || "-"}
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#6B4F3E]">
                      Total: {formatCurrency(Number(pedido.total ?? 0))}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${getEstadoClass(
                      pedido.estado,
                    )}`}
                  >
                    {getEstadoLabel(pedido.estado)}
                  </span>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#E5D8C5]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                      <tr>
                        <th className="px-4 py-3">Prenda</th>
                        <th className="px-4 py-3">Servicio</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3">Precio</th>
                        <th className="px-4 py-3">Subtotal</th>
                        <th className="px-4 py-3">Obs.</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pedido.detalles.map((detalle, index) => (
                        <tr
                          key={`${pedido.idPedido}-${index}`}
                          className="border-t border-[#E5D8C5]"
                        >
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#6B4F3E]">
                              {detalle.prenda}
                            </p>
                            <p className="text-xs text-[#8A7161]">
                              {detalle.categoriaPrenda}
                            </p>
                          </td>

                          <td className="px-4 py-3">{detalle.servicio}</td>

                          <td className="px-4 py-3">{detalle.cantidad}</td>

                          <td className="px-4 py-3">
                            {formatCurrency(Number(detalle.precioUnitario))}
                          </td>

                          <td className="px-4 py-3 font-bold">
                            {formatCurrency(Number(detalle.subtotal))}
                          </td>

                          <td className="px-4 py-3 text-[#8A7161]">
                            {detalle.observaciones || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
