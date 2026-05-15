import {ArrowLeft, CalendarDays, Package} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import logo from "../assets/imgs/lavaclean-icon.png";

export default function AgendarPage() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Aquí después puedes conectar con tu backend
    console.log("Servicio agendado");

    alert("Servicio agendado correctamente");
  };

  return (
    <main className="min-h-screen w-full bg-[#F5EEDC] text-[#6B4F3E]">
      {/* Header */}
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

      {/* Content */}
      <section className="flex min-h-screen w-full items-center justify-center px-4 pb-12 pt-28">
        <div className="w-full max-w-[540px]">
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8] shadow-md">
              <Package size={28} />
            </div>

            <h1 className="mt-5 text-4xl font-bold text-[#6B4F3E]">
              Agenda tu servicio
            </h1>

            <p className="mt-3 text-sm text-[#9A7C5F]">
              Completa el formulario y nos pondremos en contacto contigo
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white px-7 py-8 shadow-2xl"
          >
            <div className="space-y-6">
              {/* Tipo de prenda */}
              <div>
                <label
                  htmlFor="tipoPrenda"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Tipo de prenda *
                </label>

                <select
                  id="tipoPrenda"
                  name="tipoPrenda"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="ropa_diaria">Ropa diaria</option>
                  <option value="ropa_delicada">Ropa delicada</option>
                  <option value="ropa_cama">Ropa de cama</option>
                  <option value="trajes">Trajes / prendas formales</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              {/* Tipo de servicio */}
              <div>
                <label
                  htmlFor="tipoServicio"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Tipo de servicio *
                </label>

                <select
                  id="tipoServicio"
                  name="tipoServicio"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                >
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="lavado">Lavado</option>
                  <option value="lavado_planchado">Lavado y planchado</option>
                  <option value="tintoreria">Tintorería</option>
                  <option value="express">Servicio express</option>
                  <option value="domicilio">Servicio a domicilio</option>
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label
                  htmlFor="cantidad"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Cantidad de prendas *
                </label>

                <input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label
                  htmlFor="observaciones"
                  className="mb-2 block text-sm font-bold text-[#7A6252]"
                >
                  Observaciones
                </label>

                <textarea
                  id="observaciones"
                  name="observaciones"
                  rows={5}
                  placeholder="Escribe aquí cualquier detalle especial, manchas difíciles, instrucciones de cuidado, etc."
                  className="w-full resize-none rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm text-[#6B4F3E] outline-none transition placeholder:text-[#B8A58F] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
              </div>

              {/* Info domicilio */}
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

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-[#6B4F3E] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#5A4334]"
              >
                Agendar servicio
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
