import {useEffect, useMemo, useState} from "react";
import {ClipboardList, RefreshCcw} from "lucide-react";
import {Link} from "react-router-dom";

import {useAuth} from "../context/AuthContext";
import {getPedidosRequest} from "../api/pedidoService";
import {getErrorMessage} from "../api/apiClient";
import type {EstadoPedido, Pedido} from "../types/pedido";
import NavbarMain from "../components/NavbarMain";
import {compararPedidosRecientesPrimero, formatPeso} from "../utils/pedido";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

function getEstadoLabel(estado: EstadoPedido) {
  const labels: Record<EstadoPedido, string> = {
    PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
    PENDIENTE_PESAJE: "Pendiente de pesaje",
    LISTO_PARA_RETIRO: "Listo para retiro",
    REVISION: "Revisión",
    CONFIRMADO: "Confirmado",
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
    ENTREGADO: "Entregado",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
  };

  return labels[estado] ?? estado;
}

function getEstadoClass(estado: EstadoPedido) {
  const classes: Record<EstadoPedido, string> = {
    PENDIENTE_CONFIRMACION: "bg-sky-100 text-sky-700",
    PENDIENTE_PESAJE: "bg-sky-100 text-sky-700",
    LISTO_PARA_RETIRO: "bg-indigo-100 text-indigo-700",
    REVISION: "bg-sky-100 text-sky-700",
    CONFIRMADO: "bg-cyan-100 text-cyan-700",
    EN_PROCESO: "bg-cyan-100 text-cyan-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    ENTREGADO: "bg-indigo-100 text-indigo-700",
    PAGADO: "bg-blue-100 text-blue-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return classes[estado] ?? "bg-gray-100 text-gray-700";
}

export default function PedidosPage() {
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
      setErrorMessage(getErrorMessage(error, "No se pudieron cargar tus pedidos."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, [token, user]);

  const pedidosOrdenados = useMemo(() => {
    return [...pedidos].sort(compararPedidosRecientesPrimero);
  }, [pedidos]);

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] text-[#111827]">
      <NavbarMain />

      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-32">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D4ED8] text-[#EFF6FF]">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-[#111827]">
                  Mis pedidos
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                  Revisa el estado y detalle de tus servicios agendados.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadPedidos}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#111827] shadow-md transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="text-sm font-semibold text-[#64748B]">
              Cargando tus pedidos...
            </p>
          </section>
        ) : pedidosOrdenados.length === 0 ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-[#111827]">
              Aún no tienes pedidos
            </h2>

            <p className="mt-3 text-sm text-[#64748B]">
              Cuando agendes un servicio, aparecerá en esta sección.
            </p>

            <Link
              to="/agendar"
              className="mt-6 inline-flex rounded-full bg-[#1D4ED8] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1E40AF]"
            >
              Agendar servicio
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {pedidosOrdenados.map((pedido) => (
              <article
                key={pedido.idPedido}
                className="rounded-3xl border border-[#DBEAFE] bg-white p-6 shadow-xl"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#111827]">
                      Pedido #{pedido.idPedido}
                    </h2>

                    <p className="mt-2 text-sm text-[#475569]">
                      Llegada: {pedido.fechaLlegada ?? pedido.fecha_llegada ?? "-"} · Entrega:{" "}
                      {pedido.fechaEntrega ?? pedido.fecha_entrega ?? "-"}
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

                {pedido.servicioBase && (
                  <div className="mt-5 rounded-2xl bg-[#EFF6FF] p-4">
                    <p className="text-xs font-bold uppercase text-[#475569]">Servicio base</p>
                    <p className="mt-1 font-bold">{pedido.servicioBase.nombre}</p>
                    {pedido.servicioBase.opcionNombre && (
                      <p className="text-sm text-[#475569]">Opción: {pedido.servicioBase.opcionNombre}</p>
                    )}
                    {pedido.servicioBase.observaciones && (
                      <p className="text-sm text-[#475569]">{pedido.servicioBase.observaciones}</p>
                    )}
                    {(pedido.serviciosExtras?.length ?? 0) > 0 && (
                      <div className="mt-3 border-t border-[#DBEAFE] pt-3">
                        <p className="text-xs font-bold uppercase text-[#475569]">Servicios extras</p>
                        <ul className="mt-1 text-sm">
                          {pedido.serviciosExtras?.map((extra) => (
                            <li key={extra.idPedidoServicio}>
                              {extra.nombre}{extra.opcionNombre ? ` · ${extra.opcionNombre}` : ""} · {formatCurrency(Number(extra.precioFinal ?? extra.precioEstimado))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className={`mt-5 rounded-2xl border p-4 ${pedido.precioFinal != null ? "border-blue-300 bg-blue-50" : "border-sky-300 bg-sky-50"}`}>
                  <p className={`text-xs font-bold uppercase ${pedido.precioFinal != null ? "text-blue-700" : "text-sky-700"}`}>
                    {pedido.precioFinal != null ? "Valores finales" : "Valores estimados"}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {pedido.servicioBase?.modalidadCobro === "POR_CARGA" && <span>Peso: <strong>{formatPeso(Number(pedido.pesoRealKg ?? pedido.pesoEstimadoKg ?? 0))}</strong></span>}
                    {pedido.servicioBase?.modalidadCobro === "POR_CARGA" && <span>Cargas: <strong>{pedido.cargasReales ?? pedido.cargasEstimadas ?? 0}</strong></span>}
                    <span>Precio: <strong>{formatCurrency(Number(pedido.precioFinal ?? pedido.precioEstimado ?? pedido.total ?? 0))}</strong></span>
                  </div>
                  {pedido.pesoRealKg == null && pedido.servicioBase?.modalidadCobro === "POR_CARGA" && (
                    <p className="mt-2 text-xs text-sky-800">
                      El peso y el precio son estimados hasta que la sucursal registre el peso real.
                    </p>
                  )}
                </div>

                {(pedido.detalles?.length ?? 0) > 0 && <div className="mt-6 overflow-hidden rounded-2xl border border-[#DBEAFE]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FFFFFF] text-[#111827]">
                      <tr>
                        <th className="px-4 py-3">Prenda</th>
                        <th className="px-4 py-3">Servicio</th>
                        <th className="px-4 py-3">Cantidad</th>
                        {(pedido.servicioBase?.modalidadCobro === "POR_CARGA" || !pedido.servicioBase) && <>
                          <th className="px-4 py-3">Peso ref.</th>
                          <th className="px-4 py-3">Peso estimado</th>
                        </>}
                        {pedido.servicioBase?.modalidadCobro === "POR_OPCION" && (
                          <th className="px-4 py-3">Subtotal</th>
                        )}
                        <th className="px-4 py-3">Obs.</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pedido.detalles.map((detalle, index) => (
                        <tr
                          key={`${pedido.idPedido}-${index}`}
                          className="border-t border-[#DBEAFE]"
                        >
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#111827]">
                              {detalle.prenda}
                            </p>
                            <p className="text-xs text-[#475569]">
                              {detalle.categoriaPrenda}
                            </p>
                          </td>

                          <td className="px-4 py-3">{detalle.servicio}</td>

                          <td className="px-4 py-3">{detalle.cantidad}</td>

                          {(pedido.servicioBase?.modalidadCobro === "POR_CARGA" || !pedido.servicioBase) && <>
                            <td className="px-4 py-3">
                              {formatPeso(Number(detalle.pesoReferenciaKg ?? 0))}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {formatPeso(Number(detalle.pesoEstimadoKg ?? (detalle.pesoReferenciaKg ?? 0) * detalle.cantidad))}
                            </td>
                          </>}
                          {pedido.servicioBase?.modalidadCobro === "POR_OPCION" && (
                            <td className="px-4 py-3 font-bold">
                              {formatCurrency(Number(pedido.servicioBase.precioUnitario) * detalle.cantidad)}
                            </td>
                          )}

                          <td className="px-4 py-3 text-[#475569]">
                            {detalle.observaciones || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
