import {useEffect, useMemo, useState} from "react";
import {ClipboardList, Plus, RefreshCcw, Trash2} from "lucide-react";

import {useAuth} from "../../context/AuthContext";
import {
  createPedidoRequest,
  deletePedidoRequest,
  getPedidosRequest,
  updateEstadoPedidoRequest,
} from "../../api/pedidoService";
import {getPrendasRequest} from "../../api/prendaService";
import {getServiciosRequest} from "../../api/servicioService";
import {getUsuariosRequest} from "../../api/usuarioService";

import type {EstadoPedido, Pedido, Prenda, Servicio} from "../../types/pedido";
import type {AuthUser} from "../../types/auth";

type DetalleForm = {
  idPrenda: string;
  idServicio: string;
  cantidad: string;
  observaciones: string;
};

type PedidoForm = {
  idUsuario: string;
  fechaLlegada: string;
  fechaEntrega: string;
};

const emptyPedidoForm: PedidoForm = {
  idUsuario: "",
  fechaLlegada: "",
  fechaEntrega: "",
};

const emptyDetalle: DetalleForm = {
  idPrenda: "",
  idServicio: "",
  cantidad: "1",
  observaciones: "",
};

const estadosPedido: EstadoPedido[] = [
  "REVISION",
  "CONFIRMADO",
  "COMPLETADO",
  "EN_PROCESO",
  "PAGADO",
  "CANCELADO",
  "ENTREGADO",
];

function getEstadoLabel(estado: EstadoPedido) {
  const labels: Record<EstadoPedido, string> = {
    REVISION: "Revisión",
    CONFIRMADO: "Confirmado",
    COMPLETADO: "Completado",
    EN_PROCESO: "En proceso",
    PAGADO: "Pagado",
    CANCELADO: "Cancelado",
    ENTREGADO: "Entregado",
  };

  return labels[estado];
}

function getEstadoClass(estado: EstadoPedido) {
  const classes: Record<EstadoPedido, string> = {
    REVISION: "bg-orange-100 text-orange-700",
    CONFIRMADO: "bg-yellow-100 text-yellow-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    EN_PROCESO: "bg-cyan-100 text-cyan-700",
    PAGADO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
    ENTREGADO: "bg-purple-100 text-purple-700",
  };

  return classes[estado];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

export default function AdminOrdersPage() {
  const {token} = useAuth();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<AuthUser[]>([]);
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [form, setForm] = useState<PedidoForm>(emptyPedidoForm);
  const [detalles, setDetalles] = useState<DetalleForm[]>([{...emptyDetalle}]);

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "TODOS">(
    "TODOS",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [pedidosData, clientesData, prendasData, serviciosData] =
        await Promise.all([
          getPedidosRequest(token),
          getUsuariosRequest(token),
          getPrendasRequest(token),
          getServiciosRequest(token),
        ]);

      setPedidos(pedidosData);
      setClientes(clientesData);
      setPrendas(prendasData);
      setServicios(serviciosData);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const pedidosFiltrados =
    estadoFiltro === "TODOS"
      ? pedidos
      : pedidos.filter((pedido) => pedido.estado === estadoFiltro);

  const getClienteNombre = (idUsuario: number) => {
    const cliente = clientes.find((item) => item.idUsuario === idUsuario);

    if (!cliente) return `Usuario #${idUsuario}`;

    return `${cliente.nombres} ${cliente.apPaterno}`.trim();
  };

  const getServicioPrecio = (idServicio: string) => {
    const servicio = servicios.find(
      (item) => item.idServicio === Number(idServicio),
    );

    return Number(servicio?.precio ?? 0);
  };

  const totalEstimado = useMemo(() => {
    return detalles.reduce((total, detalle) => {
      const precio = getServicioPrecio(detalle.idServicio);
      const cantidad = Number(detalle.cantidad || 0);

      return total + precio * cantidad;
    }, 0);
  }, [detalles, servicios]);

  const handleDetalleChange = (
    index: number,
    field: keyof DetalleForm,
    value: string,
  ) => {
    setDetalles((prev) =>
      prev.map((detalle, detalleIndex) =>
        detalleIndex === index
          ? {
              ...detalle,
              [field]: value,
            }
          : detalle,
      ),
    );
  };

  const handleAddDetalle = () => {
    setDetalles((prev) => [...prev, {...emptyDetalle}]);
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles((prev) =>
      prev.filter((_, detalleIndex) => detalleIndex !== index),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    if (!form.idUsuario) {
      setErrorMessage("Debes seleccionar un cliente.");
      return;
    }

    if (!form.fechaLlegada || !form.fechaEntrega) {
      setErrorMessage("Debes seleccionar fecha de llegada y fecha de entrega.");
      return;
    }

    const hasInvalidDetalle = detalles.some(
      (detalle) =>
        !detalle.idPrenda ||
        !detalle.idServicio ||
        Number(detalle.cantidad) < 1,
    );

    if (hasInvalidDetalle) {
      setErrorMessage(
        "Debes completar cada detalle con prenda, servicio y cantidad válida.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createPedidoRequest(
        {
          idUsuario: Number(form.idUsuario),
          fechaLlegada: form.fechaLlegada,
          fechaEntrega: form.fechaEntrega,
          detalles: detalles.map((detalle) => ({
            idPrenda: Number(detalle.idPrenda),
            idServicio: Number(detalle.idServicio),
            cantidad: Number(detalle.cantidad),
            observaciones: detalle.observaciones.trim(),
          })),
        },
        token,
      );

      setForm(emptyPedidoForm);
      setDetalles([{...emptyDetalle}]);

      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo crear el pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeEstado = async (idPedido: number, estado: EstadoPedido) => {
    if (!token) return;

    try {
      setErrorMessage("");

      await updateEstadoPedidoRequest(idPedido, estado, token);
      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo actualizar el estado del pedido.");
    }
  };

  const handleDelete = async (idPedido: number) => {
    if (!token) return;

    const confirmed = confirm("¿Seguro que deseas eliminar este pedido?");
    if (!confirmed) return;

    try {
      setErrorMessage("");

      await deletePedidoRequest(idPedido, token);
      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo eliminar el pedido.");
    }
  };

  return (
    <section className="min-h-screen bg-[#F5EEDC] px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#6B4F3E]">
            Gestión de pedidos
          </h1>

          <p className="mt-2 text-sm text-[#9A7C5F]">
            Crea, revisa y administra pedidos con sus detalles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {estadosPedido.map((estado) => (
            <SummaryCard
              key={estado}
              title={getEstadoLabel(estado)}
              value={
                pedidos.filter((pedido) => pedido.estado === estado).length
              }
            />
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#F5EEDC] p-3 text-[#6B4F3E]">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#6B4F3E]">Nuevo pedido</h2>

              <p className="text-sm text-[#9A7C5F]">
                Selecciona cliente, prendas y servicios.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <select
              value={form.idUsuario}
              onChange={(event) =>
                setForm({...form, idUsuario: event.target.value})
              }
              required
              disabled={isSaving}
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
            >
              <option value="">Selecciona un cliente</option>

              {clientes
                .filter((cliente) => cliente.rol === "CLIENTE")
                .map((cliente) => (
                  <option key={cliente.idUsuario} value={cliente.idUsuario}>
                    {cliente.nombres} {cliente.apPaterno} - {cliente.correo}
                  </option>
                ))}
            </select>

            <div className="space-y-5">
              {detalles.map((detalle, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#D8C7AF] bg-[#FDF8ED] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#6B4F3E]">
                        Detalle #{index + 1}
                      </h3>

                      <p className="mt-1 text-xs text-[#9A7C5F]">
                        Selecciona prenda, servicio y cantidad.
                      </p>
                    </div>

                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDetalle(index)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200 disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <select
                      value={detalle.idPrenda}
                      onChange={(event) =>
                        handleDetalleChange(
                          index,
                          "idPrenda",
                          event.target.value,
                        )
                      }
                      required
                      disabled={isSaving}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                    >
                      <option value="">Selecciona una prenda</option>

                      {prendas.map((prenda) => (
                        <option key={prenda.idPrenda} value={prenda.idPrenda}>
                          {prenda.nombrePrenda} - {prenda.categoria}
                        </option>
                      ))}
                    </select>

                    <select
                      value={detalle.idServicio}
                      onChange={(event) =>
                        handleDetalleChange(
                          index,
                          "idServicio",
                          event.target.value,
                        )
                      }
                      required
                      disabled={isSaving}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                    >
                      <option value="">Selecciona un servicio</option>

                      {servicios.map((servicio) => (
                        <option
                          key={servicio.idServicio}
                          value={servicio.idServicio}
                        >
                          {servicio.tipoServicio} -{" "}
                          {formatCurrency(Number(servicio.precio))}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={detalle.cantidad}
                      onChange={(event) =>
                        handleDetalleChange(
                          index,
                          "cantidad",
                          event.target.value,
                        )
                      }
                      required
                      disabled={isSaving}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                    />
                  </div>

                  <textarea
                    value={detalle.observaciones}
                    onChange={(event) =>
                      handleDetalleChange(
                        index,
                        "observaciones",
                        event.target.value,
                      )
                    }
                    rows={3}
                    disabled={isSaving}
                    placeholder="Observaciones para este detalle"
                    className="mt-4 w-full resize-none rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddDetalle}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#8A6A53] px-5 py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-[#F5EEDC] disabled:opacity-60"
              >
                <Plus size={18} />
                Agregar otra prenda o servicio
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={form.fechaLlegada}
                onChange={(event) =>
                  setForm({...form, fechaLlegada: event.target.value})
                }
                required
                disabled={isSaving}
                className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
              />

              <input
                type="date"
                value={form.fechaEntrega}
                onChange={(event) =>
                  setForm({...form, fechaEntrega: event.target.value})
                }
                required
                disabled={isSaving}
                className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
              />
            </div>

            {totalEstimado > 0 && (
              <div className="rounded-lg bg-[#F8F5EE] px-4 py-3 text-sm font-bold text-[#6B4F3E]">
                Total estimado: {formatCurrency(totalEstimado)}
              </div>
            )}

            {errorMessage && (
              <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6B4F3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334] disabled:opacity-60"
            >
              <Plus size={18} />
              {isSaving ? "Guardando..." : "Crear pedido"}
            </button>
          </div>
        </form>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#6B4F3E]">
                Listado de pedidos
              </h2>

              <p className="mt-1 text-sm text-[#9A7C5F]">
                Total registrados: {pedidosFiltrados.length}
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={estadoFiltro}
                onChange={(event) =>
                  setEstadoFiltro(event.target.value as EstadoPedido | "TODOS")
                }
                className="rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
              >
                <option value="TODOS">Todos</option>

                {estadosPedido.map((estado) => (
                  <option key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-lg bg-[#F5EEDC] px-4 py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-[#E8D8BE]"
              >
                <RefreshCcw size={17} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-[#9A7C5F]">Cargando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="rounded-2xl bg-[#F8F5EE] p-5 text-sm text-[#9A7C5F]">
              No hay pedidos registrados todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <article
                  key={pedido.idPedido}
                  className="rounded-2xl border border-[#E5D8C5] bg-[#F8F5EE] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#6B4F3E]">
                        Pedido #{pedido.idPedido}
                      </h3>

                      <p className="mt-1 text-sm text-[#8A7161]">
                        Cliente: {getClienteNombre(pedido.idUsuario)}
                      </p>

                      <p className="mt-1 text-sm text-[#8A7161]">
                        Llegada: {pedido.fechaLlegada} · Entrega:{" "}
                        {pedido.fechaEntrega}
                      </p>

                      <p className="mt-2 font-bold text-[#6B4F3E]">
                        Total: {formatCurrency(Number(pedido.total))}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getEstadoClass(
                          pedido.estado,
                        )}`}
                      >
                        {getEstadoLabel(pedido.estado)}
                      </span>

                      <select
                        value={pedido.estado}
                        onChange={(event) =>
                          handleChangeEstado(
                            pedido.idPedido,
                            event.target.value as EstadoPedido,
                          )
                        }
                        className="rounded-lg border border-[#D8C7AF] bg-white px-3 py-2 text-xs font-bold outline-none"
                      >
                        {estadosPedido.map((estado) => (
                          <option key={estado} value={estado}>
                            {getEstadoLabel(estado)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDelete(pedido.idPedido)}
                        className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-xl border border-[#E5D8C5] bg-white">
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
                        {(pedido.detalles ?? []).map((detalle, index) => (
                          <tr
                            key={`${pedido.idPedido}-${index}`}
                            className="border-t border-[#E5D8C5]"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold">{detalle.prenda}</p>
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
      </div>
    </section>
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
