import {useEffect, useState} from "react";
import {ArrowLeft, CalendarDays, Package} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {getPrendasRequest} from "../api/prendaService";
import {getServiciosRequest} from "../api/servicioService";
import {createPedidoRequest} from "../api/pedidoService";
import type {Prenda, Servicio} from "../types/pedido";
import logo from "../assets/imgs/lavaclean-icon.png";

export default function AgendarPage() {
  const navigate = useNavigate();
  const {token, user} = useAuth();

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [idPrenda, setIdPrenda] = useState("");
  const [idServicio, setIdServicio] = useState("");
  const [cantidadPrendas, setCantidadPrendas] = useState(1);
  const [observaciones, setObservaciones] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const servicioSeleccionado = servicios.find(
    (servicio) => servicio.idServicio === Number(idServicio),
  );

  const totalEstimado =
    servicioSeleccionado && cantidadPrendas > 0
      ? Number(servicioSeleccionado.precio) * cantidadPrendas
      : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !user) {
      setErrorMessage("Debes iniciar sesión para agendar un servicio.");
      return;
    }

    if (!idPrenda || !idServicio) {
      setErrorMessage("Debes seleccionar una prenda y un servicio.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      await createPedidoRequest(
        {
          idUsuario: user.idUsuario,
          idPrenda: Number(idPrenda),
          idServicio: Number(idServicio),
          cantidadPrendas: Number(cantidadPrendas),
          observaciones: observaciones.trim(),
        },
        token,
      );

      alert("Servicio agendado correctamente.");
      navigate("/mis-pedidos");
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo agendar el servicio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
        <div className="w-full max-w-[540px]">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8] shadow-md">
              <Package size={28} />
            </div>

            <h1 className="mt-5 text-4xl font-bold text-[#6B4F3E]">
              Agenda tu servicio
            </h1>

            <p className="mt-3 text-sm text-[#9A7C5F]">
              Selecciona una prenda y servicio disponible
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
                <label
                  htmlFor="idPrenda"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Tipo de prenda *
                </label>

                <select
                  id="idPrenda"
                  value={idPrenda}
                  onChange={(event) => setIdPrenda(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                >
                  <option value="">Selecciona una prenda</option>

                  {prendas.map((prenda) => (
                    <option key={prenda.idPrenda} value={prenda.idPrenda}>
                      {prenda.nombrePrenda} - {prenda.categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="idServicio"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Tipo de servicio *
                </label>

                <select
                  id="idServicio"
                  value={idServicio}
                  onChange={(event) => setIdServicio(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                >
                  <option value="">Selecciona un servicio</option>

                  {servicios.map((servicio) => (
                    <option
                      key={servicio.idServicio}
                      value={servicio.idServicio}
                    >
                      {servicio.tipoServicio} - $
                      {Number(servicio.precio).toLocaleString("es-CL")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cantidadPrendas"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Cantidad de prendas *
                </label>

                <input
                  id="cantidadPrendas"
                  type="number"
                  min={1}
                  value={cantidadPrendas}
                  onChange={(event) =>
                    setCantidadPrendas(Number(event.target.value))
                  }
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="observaciones"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Observaciones
                </label>

                <textarea
                  id="observaciones"
                  rows={5}
                  value={observaciones}
                  onChange={(event) => setObservaciones(event.target.value)}
                  placeholder="Escribe cualquier detalle especial, manchas difíciles o instrucciones de cuidado."
                  className="w-full resize-none rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
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

              {servicioSeleccionado && (
                <div className="rounded-lg bg-[#F5EEDC] px-4 py-3 text-sm font-semibold text-[#6B4F3E]">
                  Total estimado:{" "}
                  <span className="font-bold">
                    ${totalEstimado.toLocaleString("es-CL")}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving || isLoadingData}
                className="w-full rounded-lg bg-[#6B4F3E] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#5A4334] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Agendando..." : "Agendar servicio"}
              </button>

              <p className="text-center text-xs text-[#B8A58F]">
                Al agendar, aceptas nuestros términos de servicio
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
