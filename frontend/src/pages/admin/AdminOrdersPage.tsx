import {useEffect, useMemo, useState} from "react";
import {ClipboardList, Plus, RefreshCcw, Trash2} from "lucide-react";

import {useAuth} from "../../context/AuthContext";
import {
  createPedidoRequest,
  confirmarPesoPedidoRequest,
  deletePedidoRequest,
  getPedidosRequest,
  updateEstadoPedidoRequest,
} from "../../api/pedidoService";
import {getPrendasRequest} from "../../api/prendaService";
import {
  getServiciosBaseRequest,
  getServiciosExtrasRequest,
} from "../../api/servicioService";
import {getUsuariosRequest} from "../../api/usuarioService";
import {getErrorMessage} from "../../api/apiClient";

import type {EstadoPedido, Pedido, Prenda, Servicio} from "../../types/pedido";
import type {AuthUser} from "../../types/auth";
import {
  compararPedidosRecientesPrimero,
  formatPeso,
  getCargas,
  getPesoReferencia,
  getPrecioPorCarga,
  getPrecioServicio,
} from "../../utils/pedido";

type DetalleForm = {
  idPrenda: string;
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
  cantidad: "1",
  observaciones: "",
};

const estadosPedido: EstadoPedido[] = [
  "PENDIENTE_CONFIRMACION",
  "PENDIENTE_PESAJE",
  "REVISION",
  "CONFIRMADO",
  "COMPLETADO",
  "EN_PROCESO",
  "PAGADO",
  "CANCELADO",
  "ENTREGADO",
  "LISTO_PARA_RETIRO",
];

function getEstadoLabel(estado: EstadoPedido) {
  const labels: Record<EstadoPedido, string> = {
    PENDIENTE_CONFIRMACION: "Pend. confirmación",
    PENDIENTE_PESAJE: "Pend. pesaje",
    LISTO_PARA_RETIRO: "Listo para retiro",
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
    PENDIENTE_CONFIRMACION: "bg-sky-100 text-sky-700",
    PENDIENTE_PESAJE: "bg-sky-100 text-sky-700",
    LISTO_PARA_RETIRO: "bg-indigo-100 text-indigo-700",
    REVISION: "bg-sky-100 text-sky-700",
    CONFIRMADO: "bg-cyan-100 text-cyan-700",
    COMPLETADO: "bg-blue-100 text-blue-700",
    EN_PROCESO: "bg-cyan-100 text-cyan-700",
    PAGADO: "bg-blue-100 text-blue-700",
    CANCELADO: "bg-red-100 text-red-700",
    ENTREGADO: "bg-indigo-100 text-indigo-700",
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
  const [serviciosExtras, setServiciosExtras] = useState<Servicio[]>([]);

  const [form, setForm] = useState<PedidoForm>(emptyPedidoForm);
  const [detalles, setDetalles] = useState<DetalleForm[]>([{...emptyDetalle}]);
  const [idServicio, setIdServicio] = useState("");
  const [opcionBaseCodigo, setOpcionBaseCodigo] = useState("");
  const [idsExtras, setIdsExtras] = useState<number[]>([]);
  const [pesosReales, setPesosReales] = useState<Record<number, string>>({});

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

      const [pedidosData, clientesData, prendasData, serviciosData, extrasData] =
        await Promise.all([
          getPedidosRequest(token),
          getUsuariosRequest(token),
          getPrendasRequest(token),
          getServiciosBaseRequest(token),
          getServiciosExtrasRequest(token),
        ]);

      setPedidos(pedidosData);
      setClientes(clientesData);
      setPrendas(prendasData);
      setServicios(serviciosData);
      setServiciosExtras(extrasData);
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "No se pudieron cargar los pedidos."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const pedidosFiltrados = useMemo(() => {
    const filtrados = estadoFiltro === "TODOS"
      ? pedidos
      : pedidos.filter((pedido) => pedido.estado === estadoFiltro);

    return [...filtrados].sort(compararPedidosRecientesPrimero);
  }, [estadoFiltro, pedidos]);

  const getClienteNombre = (idUsuario: number) => {
    const cliente = clientes.find((item) => item.idUsuario === idUsuario);

    if (!cliente) return `Usuario #${idUsuario}`;

    return `${cliente.nombres} ${cliente.apPaterno}`.trim();
  };

  const resumenEstimado = useMemo(() => {
    const servicio = servicios.find(
      (item) => item.idServicio === Number(idServicio),
    );
    const esPorCarga = (servicio?.modalidadCobro ?? "POR_CARGA") === "POR_CARGA";
    const peso = detalles.reduce((total, detalle) => {
      const prenda = prendas.find(
        (item) => item.idPrenda === Number(detalle.idPrenda),
      );
      return total + getPesoReferencia(prenda) * Number(detalle.cantidad || 0);
    }, 0);
    const cargas = esPorCarga ? getCargas(peso) : 0;
    const cantidadPrendas = detalles.reduce(
      (total, detalle) => total + Number(detalle.cantidad || 0),
      0,
    );
    const precioBase = esPorCarga
      ? cargas * getPrecioPorCarga(servicio)
      : getPrecioServicio(servicio, opcionBaseCodigo) * Math.max(cantidadPrendas, 1);
    const precioExtras = idsExtras.reduce((total, id) =>
      total + getPrecioServicio(serviciosExtras.find((item) => item.idServicio === id)), 0);
    return {peso, cargas, cantidadPrendas, precioBase, precioExtras, precio: precioBase + precioExtras};
  }, [detalles, prendas, servicios, serviciosExtras, idServicio, opcionBaseCodigo, idsExtras]);

  const servicioBase = servicios.find(
    (item) => item.idServicio === Number(idServicio),
  );
  const esPorCarga =
    (servicioBase?.modalidadCobro ?? "POR_CARGA") === "POR_CARGA";
  const admiteDetalles =
    esPorCarga || servicioBase?.modalidadCobro === "POR_OPCION";

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

    if (!idServicio) {
      setErrorMessage("Debes seleccionar un servicio para todo el pedido.");
      return;
    }

    if (servicioBase?.modalidadCobro === "POR_OPCION" && !opcionBaseCodigo) {
      setErrorMessage("Debes seleccionar una opción para el servicio base.");
      return;
    }

    if (!form.fechaLlegada || !form.fechaEntrega) {
      setErrorMessage("Debes seleccionar fecha de llegada y fecha de entrega.");
      return;
    }

    const hasInvalidDetalle = admiteDetalles && detalles.some(
      (detalle) =>
        !detalle.idPrenda || Number(detalle.cantidad) < 1,
    );

    if (hasInvalidDetalle) {
      setErrorMessage(
        "Debes completar cada detalle con prenda y cantidad válida.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createPedidoRequest(
        {
          idUsuario: Number(form.idUsuario),
          fecha_llegada: form.fechaLlegada,
          fecha_entrega: form.fechaEntrega,
          idServicioBase: Number(idServicio),
          opcionBaseCodigo: opcionBaseCodigo || undefined,
          detalles: admiteDetalles ? detalles.map((detalle) => ({
            idPrenda: Number(detalle.idPrenda),
            cantidad: Number(detalle.cantidad),
            observaciones: detalle.observaciones.trim(),
          })) : [],
          serviciosExtras: idsExtras.map((id) => ({idServicio: id, cantidad: 1})),
        },
        token,
      );

      setForm(emptyPedidoForm);
      setDetalles([{...emptyDetalle}]);
      setIdServicio("");
      setOpcionBaseCodigo("");
      setIdsExtras([]);

      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "No se pudo crear el pedido."));
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
      setErrorMessage(
        getErrorMessage(error, "No se pudo actualizar el estado del pedido."),
      );
    }
  };

  const handleConfirmarPeso = async (idPedido: number) => {
    if (!token) return;
    const pesoRealKg = Number(pesosReales[idPedido]);
    if (!Number.isFinite(pesoRealKg) || pesoRealKg <= 0) {
      setErrorMessage("Ingresa un peso real mayor que 0 kg.");
      return;
    }

    try {
      setErrorMessage("");
      await confirmarPesoPedidoRequest(idPedido, pesoRealKg, token);
      setPesosReales((prev) => ({...prev, [idPedido]: ""}));
      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getErrorMessage(error, "No se pudo confirmar el peso del pedido."),
      );
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
      setErrorMessage(getErrorMessage(error, "No se pudo eliminar el pedido."));
    }
  };

  return (
    <section className="min-h-screen bg-[#FFFFFF] px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">
            Gestión de pedidos
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
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
            <div className="rounded-xl bg-[#FFFFFF] p-3 text-[#111827]">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111827]">Nuevo pedido</h2>

              <p className="text-sm text-[#64748B]">
                Selecciona cliente, un servicio y las prendas.
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
              className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
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

            <select
              value={idServicio}
              onChange={(event) => {
                setIdServicio(event.target.value);
                setOpcionBaseCodigo("");
              }}
              required
              disabled={isSaving}
              className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
            >
              <option value="">Servicio base</option>
              {servicios.map((servicio) => (
                <option key={servicio.idServicio} value={servicio.idServicio}>
                  {servicio.tipoServicio} - {servicio.modalidadCobro === "POR_OPCION" ? "según opción" : formatCurrency(getPrecioPorCarga(servicio))}
                </option>
              ))}
            </select>

            {servicioBase?.modalidadCobro === "POR_OPCION" && (
              <select
                value={opcionBaseCodigo}
                onChange={(event) => setOpcionBaseCodigo(event.target.value)}
                required
                className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm"
              >
                <option value="">Selecciona tipo o tamaño</option>
                {(servicioBase.opciones ?? []).filter((opcion) => opcion.activo).map((opcion) => (
                  <option key={opcion.codigo} value={opcion.codigo}>{opcion.nombre} - {formatCurrency(opcion.precio)}</option>
                ))}
              </select>
            )}

            {serviciosExtras.length > 0 && (
              <div className="rounded-xl border border-[#BFDBFE] p-4">
                <p className="text-sm font-bold">Servicios extras opcionales</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {serviciosExtras.filter((extra) => extra.modalidadCobro !== "POR_OPCION").map((extra) => (
                    <label key={extra.idServicio} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={idsExtras.includes(extra.idServicio)}
                        onChange={(event) => setIdsExtras((prev) => event.target.checked
                          ? [...prev, extra.idServicio]
                          : prev.filter((id) => id !== extra.idServicio))}
                      />
                      {extra.tipoServicio} ({formatCurrency(getPrecioServicio(extra))})
                    </label>
                  ))}
                </div>
              </div>
            )}

            {admiteDetalles && idServicio && <div className="space-y-5">
              {detalles.map((detalle, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#BFDBFE] bg-[#F8FAFC] p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">
                        Detalle #{index + 1}
                      </h3>

                      <p className="mt-1 text-xs text-[#64748B]">
                        Selecciona prenda y cantidad.
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

                  <div className="grid gap-4 md:grid-cols-2">
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
                      className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
                    >
                      <option value="">Selecciona una prenda</option>

                      {prendas.map((prenda) => (
                        <option key={prenda.idPrenda} value={prenda.idPrenda}>
                          {prenda.nombrePrenda} - {prenda.categoria}
                          {getPesoReferencia(prenda) > 0
                            ? ` (${formatPeso(getPesoReferencia(prenda))}/unidad)`
                            : ""}
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
                      className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
                    />
                  </div>

                  {detalle.idPrenda && esPorCarga && (
                    <p className="mt-3 text-xs font-semibold text-[#475569]">
                      Peso de referencia: {formatPeso(getPesoReferencia(prendas.find((item) => item.idPrenda === Number(detalle.idPrenda))))} · Estimado: {formatPeso(getPesoReferencia(prendas.find((item) => item.idPrenda === Number(detalle.idPrenda))) * Number(detalle.cantidad || 0))}
                  </p>
                  )}

                  {detalle.idPrenda && servicioBase?.modalidadCobro === "POR_OPCION" && (
                    <p className="mt-3 text-xs font-semibold text-[#475569]">
                      Subtotal: {formatCurrency(
                        getPrecioServicio(servicioBase, opcionBaseCodigo) *
                          Number(detalle.cantidad || 0),
                      )}
                    </p>
                  )}

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
                    className="mt-4 w-full resize-none rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddDetalle}
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2563EB] px-5 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#EFF6FF] disabled:opacity-60"
              >
                <Plus size={18} />
                Agregar otra prenda
              </button>
            </div>}

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={form.fechaLlegada}
                onChange={(event) =>
                  setForm({...form, fechaLlegada: event.target.value})
                }
                required
                disabled={isSaving}
                className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
              />

              <input
                type="date"
                value={form.fechaEntrega}
                onChange={(event) =>
                  setForm({...form, fechaEntrega: event.target.value})
                }
                required
                disabled={isSaving}
                className="w-full rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
              />
            </div>

            {idServicio && resumenEstimado.precio > 0 && (
              <div className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-950">
                <strong>Estimado:</strong> Base {formatCurrency(resumenEstimado.precioBase)} · Extras {formatCurrency(resumenEstimado.precioExtras)} · Total {formatCurrency(resumenEstimado.precio)}
                {esPorCarga && <p className="mt-1 text-xs">{formatPeso(resumenEstimado.peso)} · {resumenEstimado.cargas} carga(s). Sujeto al peso real.</p>}
                {servicioBase?.modalidadCobro === "POR_OPCION" && (
                  <p className="mt-1 text-xs">
                    {resumenEstimado.cantidadPrendas} prenda(s); precio de opción por unidad.
                  </p>
                )}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1E40AF] disabled:opacity-60"
            >
              <Plus size={18} />
              {isSaving ? "Guardando..." : "Crear pedido"}
            </button>
          </div>
        </form>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                Listado de pedidos
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Total registrados: {pedidosFiltrados.length}
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={estadoFiltro}
                onChange={(event) =>
                  setEstadoFiltro(event.target.value as EstadoPedido | "TODOS")
                }
                className="rounded-lg border border-[#BFDBFE] bg-[#FFFFFF] px-4 py-3 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#111827] transition hover:bg-[#DBEAFE]"
              >
                <RefreshCcw size={17} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-[#64748B]">Cargando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="rounded-2xl bg-[#EFF6FF] p-5 text-sm text-[#64748B]">
              No hay pedidos registrados todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <article
                  key={pedido.idPedido}
                  className="rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">
                        Pedido #{pedido.idPedido}
                      </h3>

                      <p className="mt-1 text-sm text-[#475569]">
                        Cliente: {getClienteNombre(pedido.idUsuario)}
                      </p>

                      <p className="mt-1 text-sm text-[#475569]">
                        Llegada: {pedido.fechaLlegada ?? pedido.fecha_llegada ?? "-"} · Entrega:{" "}
                        {pedido.fechaEntrega ?? pedido.fecha_entrega ?? "-"}
                      </p>
                      {pedido.servicioBase && (
                        <p className="mt-2 text-sm font-bold">
                          Base: {pedido.servicioBase.nombre}
                          {pedido.servicioBase.opcionNombre ? ` · ${pedido.servicioBase.opcionNombre}` : ""}
                        </p>
                      )}
                      {(pedido.serviciosExtras?.length ?? 0) > 0 && (
                        <p className="mt-1 text-xs text-[#475569]">
                          Extras: {pedido.serviciosExtras?.map((extra) => extra.nombre).join(", ")}
                        </p>
                      )}
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
                        className="rounded-lg border border-[#BFDBFE] bg-white px-3 py-2 text-xs font-bold outline-none"
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

                  <div className={`mt-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-3 ${pedido.precioFinal != null ? "border-blue-300 bg-blue-50" : "border-sky-300 bg-sky-50"}`}>
                    {pedido.precioFinal != null ? (
                      <>
                        {pedido.pesoRealKg != null && <div><p className="text-xs font-bold uppercase text-blue-700">Peso final</p><p className="font-bold">{formatPeso(Number(pedido.pesoRealKg))}</p></div>}
                        {pedido.cargasReales != null && <div><p className="text-xs font-bold uppercase text-blue-700">Cargas reales</p><p className="font-bold">{pedido.cargasReales}</p></div>}
                        <div><p className="text-xs font-bold uppercase text-blue-700">Precio final</p><p className="font-bold">{formatCurrency(Number(pedido.precioFinal ?? pedido.total))}</p></div>
                      </>
                    ) : (
                      <>
                        {(pedido.servicioBase?.modalidadCobro === "POR_CARGA" || !pedido.servicioBase) && <div><p className="text-xs font-bold uppercase text-sky-700">Peso estimado</p><p className="font-bold">{formatPeso(Number(pedido.pesoEstimadoKg ?? 0))}</p></div>}
                        {(pedido.servicioBase?.modalidadCobro === "POR_CARGA" || !pedido.servicioBase) && <div><p className="text-xs font-bold uppercase text-sky-700">Cargas estimadas</p><p className="font-bold">{pedido.cargasEstimadas ?? 0}</p></div>}
                        <div><p className="text-xs font-bold uppercase text-sky-700">Precio estimado</p><p className="font-bold">{formatCurrency(Number(pedido.precioEstimado ?? pedido.total))}</p></div>
                      </>
                    )}
                  </div>

                  {pedido.pesoRealKg == null && (pedido.servicioBase?.modalidadCobro === "POR_CARGA" || !pedido.servicioBase) && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={pesosReales[pedido.idPedido] ?? ""}
                        onChange={(event) => setPesosReales((prev) => ({...prev, [pedido.idPedido]: event.target.value}))}
                        placeholder="Peso real en kg"
                        className="rounded-lg border border-[#BFDBFE] bg-white px-3 py-2 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmarPeso(pedido.idPedido)}
                        className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-bold text-white"
                      >
                        Confirmar peso real
                      </button>
                    </div>
                  )}

                  {(pedido.detalles?.length ?? 0) > 0 && <div className="mt-5 overflow-hidden rounded-xl border border-[#DBEAFE] bg-white">
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
                        {(pedido.detalles ?? []).map((detalle, index) => (
                          <tr
                            key={`${pedido.idPedido}-${index}`}
                            className="border-t border-[#DBEAFE]"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold">{detalle.prenda}</p>
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
      <p className="text-sm font-semibold text-[#64748B]">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-[#111827]">{value}</h3>
    </article>
  );
}
