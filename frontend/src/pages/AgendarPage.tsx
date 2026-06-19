import {useEffect, useMemo, useState} from "react";
import {ArrowLeft, CalendarDays, Package, Plus, Trash2} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {AnimatePresence} from "motion/react";

import {useAuth} from "../context/AuthContext";
import {getPrendasRequest} from "../api/prendaService";
import {getServiciosRequest} from "../api/servicioService";
import {createPedidoRequest} from "../api/pedidoService";

import SuccessScreen from "../components/SuccessScreen";

import type {Prenda, Servicio} from "../types/pedido";

import logo from "../assets/imgs/lavaclean-icon.png";

type DetalleForm = {
  idPrenda: string;
  idServicio: string;
  cantidad: string;
  observaciones: string;
};

const emptyDetalle: DetalleForm = {
  idPrenda: "",
  idServicio: "",
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

  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle]);

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

        const [prendasData, serviciosData] = await Promise.all([
          getPrendasRequest(token),
          getServiciosRequest(token),
        ]);

        setPrendas(prendasData);
        setServicios(serviciosData);
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudieron cargar las prendas o servicios.");
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

  const getServicioPrecio = (idServicio: string) => {
    const servicio = servicios.find(
      (item) => item.idServicio === Number(idServicio),
    );

    return Number(servicio?.precio ?? 0);
  };

  const totalEstimado = useMemo(() => {
    return detalles.reduce((total, detalle) => {
      const precioServicio = getServicioPrecio(detalle.idServicio);
      const cantidad = Number(detalle.cantidad || 0);

      return total + precioServicio * cantidad;
    }, 0);
  }, [detalles, servicios]);

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

    const hasInvalidDetalle = detalles.some(
      (detalle) =>
        !detalle.idPrenda ||
        !detalle.idServicio ||
        Number(detalle.cantidad) < 1,
    );

    if (hasInvalidDetalle) {
      setErrorMessage(
        "Debes completar cada servicio con prenda, tipo de servicio y cantidad válida.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createPedidoRequest(
        {
          idUsuario: user.idUsuario,
          fechaLlegada,
          fechaEntrega,
          detalles: detalles.map((detalle) => ({
            idPrenda: Number(detalle.idPrenda),
            idServicio: Number(detalle.idServicio),
            cantidad: Number(detalle.cantidad),
            observaciones: detalle.observaciones.trim(),
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
      setErrorMessage("No se pudo agendar el servicio.");
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
                Puedes agregar una o más prendas y servicios en un mismo pedido
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

                <div className="space-y-5">
                  {detalles.map((detalle, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#D8C7AF] bg-[#FDF8ED] p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#6B4F3E]">
                            Servicio #{index + 1}
                          </h3>
                          <p className="mt-1 text-xs text-[#9A7C5F]">
                            Selecciona prenda, servicio y cantidad.
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
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#7A6252]">
                            Tipo de servicio *
                          </label>

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
                            disabled={isLoadingData || isSaving || showSuccess}
                            className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20 disabled:opacity-60"
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
                    Agregar otra prenda o servicio
                  </button>
                </div>

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

                {totalEstimado > 0 && (
                  <div className="rounded-lg bg-[#F5EEDC] px-4 py-3 text-sm font-semibold text-[#6B4F3E]">
                    Total estimado:{" "}
                    <span className="font-bold">
                      {formatCurrency(totalEstimado)}
                    </span>
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
