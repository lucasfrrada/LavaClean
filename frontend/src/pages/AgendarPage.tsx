import {useEffect, useMemo, useState} from "react";
import {ArrowLeft, CalendarDays, Package, Plus, Trash2} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {AnimatePresence} from "motion/react";

import {useAuth} from "../context/AuthContext";
import {getPrendasRequest} from "../api/prendaService";
import {
  getServiciosBaseRequest,
  getServiciosExtrasRequest,
} from "../api/servicioService";
import {createPedidoRequest} from "../api/pedidoService";
import {getErrorMessage} from "../api/apiClient";

import SuccessScreen from "../components/SuccessScreen";

import type {Prenda, Servicio} from "../types/pedido";
import {
  formatPeso,
  getCargas,
  getPesoReferencia,
  getPrecioPorCarga,
  getPrecioServicio,
} from "../utils/pedido";

import logo from "../assets/imgs/lavaclean-icon.png";

type DetalleForm = {
  idPrenda: string;
  cantidad: string;
  observaciones: string;
};

type ExtraForm = {
  opcionCodigo: string;
  cantidad: number;
  observaciones: string;
};

const emptyDetalle: DetalleForm = {
  idPrenda: "",
  cantidad: "1",
  observaciones: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().split("T")[0];
}

export default function BookingPage() {
  const navigate = useNavigate();
  const {token, user} = useAuth();

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosExtras, setServiciosExtras] = useState<Servicio[]>([]);

  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle]);
  const [idServicio, setIdServicio] = useState("");
  const [opcionBaseCodigo, setOpcionBaseCodigo] = useState("");
  const [observacionesBase, setObservacionesBase] = useState("");
  const [extras, setExtras] = useState<Record<number, ExtraForm>>({});

  const [fechaLlegada, setFechaLlegada] = useState(getTodayDate());
  const [fechaEntrega, setFechaEntrega] = useState(getTomorrowDate());

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!token) return;

      try {
        setIsLoadingData(true);
        setErrorMessage("");

        const [prendasData, serviciosData, extrasData] = await Promise.all([
          getPrendasRequest(token),
          getServiciosBaseRequest(token),
          getServiciosExtrasRequest(token),
        ]);

        setPrendas(prendasData);
        setServicios(serviciosData);
        setServiciosExtras(extrasData);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          getErrorMessage(error, "No se pudieron cargar las prendas o servicios."),
        );
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [token]);

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
    const precioPorCarga = getPrecioPorCarga(servicio);
    const precioBase = esPorCarga
      ? cargas * precioPorCarga
      : getPrecioServicio(servicio, opcionBaseCodigo);
    const precioExtras = Object.entries(extras).reduce((total, [id, extra]) => {
      const servicioExtra = serviciosExtras.find(
        (item) => item.idServicio === Number(id),
      );
      return (
        total +
        getPrecioServicio(servicioExtra, extra.opcionCodigo) * extra.cantidad
      );
    }, 0);

    return {peso, cargas, precioPorCarga, precioBase, precioExtras, precio: precioBase + precioExtras};
  }, [detalles, prendas, servicios, serviciosExtras, idServicio, opcionBaseCodigo, extras]);

  const servicioBase = servicios.find(
    (item) => item.idServicio === Number(idServicio),
  );
  const esPorCarga =
    (servicioBase?.modalidadCobro ?? "POR_CARGA") === "POR_CARGA";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !user) {
      setErrorMessage("Debes iniciar sesión para agendar un servicio.");
      return;
    }

    if (!fechaLlegada || !fechaEntrega) {
      setErrorMessage("Debes seleccionar fecha de llegada y fecha de entrega.");
      return;
    }

    if (!idServicio) {
      setErrorMessage("Debes seleccionar un tipo de servicio para el pedido.");
      return;
    }

    if (servicioBase?.modalidadCobro === "POR_OPCION" && !opcionBaseCodigo) {
      setErrorMessage("Debes seleccionar una opción para el servicio base.");
      return;
    }

    const hasInvalidDetalle = esPorCarga && detalles.some(
      (detalle) => !detalle.idPrenda || Number(detalle.cantidad) < 1,
    );

    if (hasInvalidDetalle) {
      setErrorMessage(
        "Debes completar cada prenda con una cantidad válida.",
      );
      return;
    }

    if (esPorCarga && resumenEstimado.peso < 0.5) {
      setErrorMessage("El peso estimado mínimo para lavado por carga es 0,5 kg.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createPedidoRequest(
        {
          idUsuario: user.idUsuario,
          fecha_llegada: fechaLlegada,
          fecha_entrega: fechaEntrega,
          idServicioBase: Number(idServicio),
          opcionBaseCodigo: opcionBaseCodigo || undefined,
          observacionesServicioBase: observacionesBase.trim() || undefined,
          detalles: esPorCarga ? detalles.map((detalle) => ({
            idPrenda: Number(detalle.idPrenda),
            cantidad: Number(detalle.cantidad),
            observaciones: detalle.observaciones.trim(),
          })) : [],
          serviciosExtras: Object.entries(extras).map(([id, extra]) => ({
            idServicio: Number(id),
            opcionCodigo: extra.opcionCodigo || undefined,
            cantidad: extra.cantidad,
            observaciones: extra.observaciones.trim() || undefined,
          })),
        },
        token,
      );

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/mis-pedidos");
      }, 5000);
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "No se pudo agendar el servicio."));
      setIsSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessScreen
            title="Pedido agendado correctamente"
            message="Tu pedido fue registrado con éxito. Te redirigiremos a la sección Mis pedidos."
          />
        )}
      </AnimatePresence>

      <main className="min-h-screen w-full bg-[#F5EEDC] text-[#6B4F3E]">
        <header className="fixed left-0 top-0 z-50 w-full bg-[#6B4F3E] shadow-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="Logo LavaClean"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-white">LavaClean</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Volver
            </button>
          </nav>
        </header>

        <section className="flex min-h-screen w-full items-center justify-center px-4 pb-12 pt-28">
          <div className="w-full max-w-[640px]">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8] shadow-md">
                <Package size={28} />
              </div>

              <h1 className="mt-5 text-4xl font-bold text-[#6B4F3E]">
                Agenda tu servicio
              </h1>

              <p className="mt-3 text-sm text-[#9A7C5F]">
                Elige un servicio y agrega todas las prendas de tu pedido
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white px-7 py-8 shadow-2xl"
            >
              <div className="space-y-6">
                {isLoadingData && (
                  <p className="rounded-lg bg-[#F8F5EE] px-4 py-3 text-sm font-semibold text-[#9A7C5F]">
                    Cargando prendas y servicios...
                  </p>
                )}

                {errorMessage && (
                  <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                    {errorMessage}
                  </p>
                )}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                    Servicio base *
                  </label>
                  <select
                    value={idServicio}
                    onChange={(event) => {
                      setIdServicio(event.target.value);
                      setOpcionBaseCodigo("");
                    }}
                    required
                    disabled={isLoadingData || isSaving || showSuccess}
                    className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.idServicio} value={servicio.idServicio}>
                        {servicio.tipoServicio} - {servicio.modalidadCobro === "POR_OPCION"
                          ? "precio según opción"
                          : `${formatCurrency(getPrecioPorCarga(servicio))}${servicio.modalidadCobro === "POR_CARGA" ? " por carga" : ""}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-[#9A7C5F]">
                    {servicioBase?.descripcion ?? "Este es el servicio principal del pedido."}
                  </p>
                </div>

                {servicioBase?.modalidadCobro === "POR_OPCION" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                      Tipo o tamaño *
                    </label>
                    <select
                      value={opcionBaseCodigo}
                      onChange={(event) => setOpcionBaseCodigo(event.target.value)}
                      required
                      disabled={isSaving || showSuccess}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm"
                    >
                      <option value="">Selecciona una opción</option>
                      {(servicioBase.opciones ?? []).filter((opcion) => opcion.activo).map((opcion) => (
                        <option key={opcion.codigo} value={opcion.codigo}>
                          {opcion.nombre} - {formatCurrency(Number(opcion.precio))}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {servicioBase && (
                  <textarea
                    rows={3}
                    value={observacionesBase}
                    onChange={(event) => setObservacionesBase(event.target.value)}
                    placeholder="Observaciones o especificaciones del servicio base"
                    disabled={isSaving || showSuccess}
                    className="w-full resize-none rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm"
                  />
                )}

                {esPorCarga && idServicio && <div className="space-y-5">
                  {detalles.map((detalle, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#D8C7AF] bg-[#FDF8ED] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#6B4F3E]">
                            Prenda #{index + 1}
                          </h3>
                          <p className="mt-1 text-xs text-[#9A7C5F]">
                            Selecciona el tipo de prenda y su cantidad.
                          </p>
                        </div>

                        {detalles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDetalle(index)}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                            Tipo de prenda *
                          </label>

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
                            disabled={isLoadingData || isSaving || showSuccess}
                            className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                          >
                            <option value="">Selecciona una prenda</option>

                            {prendas.map((prenda) => (
                              <option
                                key={prenda.idPrenda}
                                value={prenda.idPrenda}
                              >
                                {prenda.nombrePrenda} - {prenda.categoria}
                                {getPesoReferencia(prenda) > 0
                                  ? ` (${formatPeso(getPesoReferencia(prenda))}/unidad)`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                            Cantidad de prendas *
                          </label>

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
                            disabled={isSaving || showSuccess}
                            className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                          />
                        </div>

                        {detalle.idPrenda && (
                          <p className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#7A6252]">
                            Peso de referencia: {formatPeso(getPesoReferencia(prendas.find((item) => item.idPrenda === Number(detalle.idPrenda))))} por unidad · Peso estimado: {formatPeso(getPesoReferencia(prendas.find((item) => item.idPrenda === Number(detalle.idPrenda))) * Number(detalle.cantidad || 0))}
                          </p>
                        )}

                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                            Observaciones
                          </label>

                          <textarea
                            rows={4}
                            value={detalle.observaciones}
                            onChange={(event) =>
                              handleDetalleChange(
                                index,
                                "observaciones",
                                event.target.value,
                              )
                            }
                            disabled={isSaving || showSuccess}
                            placeholder="Ej: manchas difíciles, instrucciones especiales o cuidados."
                            className="w-full resize-none rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddDetalle}
                    disabled={isSaving || showSuccess}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#8A6A53] px-5 py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-[#F5EEDC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={18} />
                    Agregar otra prenda
                  </button>
                </div>}

                {serviciosExtras.length > 0 && (
                  <div className="rounded-2xl border border-[#D8C7AF] p-4">
                    <h3 className="font-bold text-[#6B4F3E]">Servicios extras</h3>
                    <p className="mt-1 text-xs text-[#9A7C5F]">Opcionales; puedes agregar más de uno.</p>
                    <div className="mt-4 space-y-3">
                      {serviciosExtras.map((servicio) => {
                        const seleccionado = extras[servicio.idServicio];
                        return (
                          <div key={servicio.idServicio} className="rounded-xl bg-[#F8F5EE] p-3">
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={Boolean(seleccionado)}
                                onChange={(event) => setExtras((prev) => {
                                  if (!event.target.checked) {
                                    const siguiente = {...prev};
                                    delete siguiente[servicio.idServicio];
                                    return siguiente;
                                  }
                                  return {...prev, [servicio.idServicio]: {opcionCodigo: "", cantidad: 1, observaciones: ""}};
                                })}
                                className="mt-1"
                              />
                              <span className="flex-1 text-sm">
                                <strong>{servicio.tipoServicio}</strong>
                                <span className="block text-xs text-[#8A7161]">
                                  {servicio.descripcion} · {servicio.modalidadCobro === "POR_OPCION" ? "Precio según opción" : formatCurrency(getPrecioServicio(servicio))}
                                </span>
                              </span>
                            </label>
                            {seleccionado && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {servicio.modalidadCobro === "POR_OPCION" && (
                                  <select
                                    value={seleccionado.opcionCodigo}
                                    onChange={(event) => setExtras((prev) => ({...prev, [servicio.idServicio]: {...seleccionado, opcionCodigo: event.target.value}}))}
                                    required
                                    className="rounded-lg border border-[#D8C7AF] bg-white px-3 py-2 text-sm"
                                  >
                                    <option value="">Selecciona opción</option>
                                    {(servicio.opciones ?? []).filter((opcion) => opcion.activo).map((opcion) => (
                                      <option key={opcion.codigo} value={opcion.codigo}>{opcion.nombre} - {formatCurrency(opcion.precio)}</option>
                                    ))}
                                  </select>
                                )}
                                <input
                                  type="number"
                                  min={1}
                                  value={seleccionado.cantidad}
                                  onChange={(event) => setExtras((prev) => ({...prev, [servicio.idServicio]: {...seleccionado, cantidad: Number(event.target.value)}}))}
                                  className="rounded-lg border border-[#D8C7AF] bg-white px-3 py-2 text-sm"
                                />
                                <input
                                  value={seleccionado.observaciones}
                                  onChange={(event) => setExtras((prev) => ({...prev, [servicio.idServicio]: {...seleccionado, observaciones: event.target.value}}))}
                                  placeholder="Observaciones"
                                  className="rounded-lg border border-[#D8C7AF] bg-white px-3 py-2 text-sm sm:col-span-2"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fechaLlegada"
                      className="mb-2 block text-sm font-bold text-[#7A6252]"
                    >
                      Fecha de llegada *
                    </label>

                    <input
                      id="fechaLlegada"
                      type="date"
                      value={fechaLlegada}
                      onChange={(event) => setFechaLlegada(event.target.value)}
                      required
                      disabled={isSaving || showSuccess}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fechaEntrega"
                      className="mb-2 block text-sm font-bold text-[#7A6252]"
                    >
                      Fecha de entrega *
                    </label>

                    <input
                      id="fechaEntrega"
                      type="date"
                      value={fechaEntrega}
                      onChange={(event) => setFechaEntrega(event.target.value)}
                      required
                      disabled={isSaving || showSuccess}
                      className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex gap-4 rounded-lg border border-[#D8C7AF] bg-[#F8F5EE] p-4">
                  <CalendarDays
                    size={22}
                    className="mt-1 shrink-0 text-[#8A6A53]"
                  />

                  <div>
                    <h3 className="text-sm font-bold text-[#7A6252]">
                      Servicio a domicilio incluido
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-[#9A7C5F]">
                      Recogeremos y entregaremos tu ropa en la dirección que nos
                      indiques. Te contactaremos para coordinar la fecha y hora.
                    </p>
                  </div>
                </div>

                {idServicio && resumenEstimado.precio > 0 && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                    <p className="font-bold">Valores estimados</p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-3">
                      <span>Servicio base: <strong>{formatCurrency(resumenEstimado.precioBase)}</strong></span>
                      <span>Extras: <strong>{formatCurrency(resumenEstimado.precioExtras)}</strong></span>
                      <span>Precio: <strong>{formatCurrency(resumenEstimado.precio)}</strong></span>
                    </div>
                    {esPorCarga && <p className="mt-2 text-xs">
                      Peso estimado: {formatPeso(resumenEstimado.peso)} · {resumenEstimado.cargas} carga(s).{" "}
                      El peso y el precio son estimados hasta que la sucursal registre el peso real.
                    </p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving || isLoadingData || showSuccess}
                  className="w-full rounded-lg bg-[#6B4F3E] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#5A4334] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showSuccess
                    ? "Redirigiendo..."
                    : isSaving
                      ? "Agendando..."
                      : "Agendar servicio"}
                </button>

                <p className="text-center text-xs text-[#B8A58F]">
                  Al agendar, aceptas nuestros términos de servicio
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
