import {ArrowLeft, Info, Fingerprint} from "lucide-react";
import logo from "../assets/imgs/lavaclean-icon.png";
import {Link} from "react-router-dom";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#6B4F3E] via-[#7C604B] to-[#9A7C5F] px-4 py-10 text-white">
      {/* Botón volver */}
      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver
      </Link>

      {/* Card login */}
      <section className="w-full max-w-[370px] rounded-3xl bg-[#241E1A] px-7 py-8 shadow-2xl">
        {/* Logo */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2E2722] shadow-[0_0_35px_rgba(245,238,220,0.45)]">
          <img
            src={logo}
            alt="Logo LavaClean"
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* Título */}
        <h1 className="mt-7 text-center text-xl font-bold">
          Iniciar sesión en LavaClean
        </h1>

        {/* Formulario */}
        <form className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Correo o número de teléfono
            </label>
            <input
              id="email"
              type="text"
              placeholder="Correo o número de teléfono"
              className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
            />
          </div>

          <button
            type="button"
            className="block w-full pt-2 text-center text-xs font-semibold text-[#D8C7AF] transition hover:text-white"
          >
            Crear tu cuenta de LavaClean
          </button>

          {/* Información */}
          <div className="mt-5 flex gap-3 rounded-lg bg-[#15110F] p-4 text-xs leading-relaxed text-[#C9B8A4]">
            <Info size={18} className="mt-0.5 shrink-0 text-[#D8C7AF]" />
            <p>
              La información de tu cuenta de LavaClean se usa para permitir
              iniciar sesión de forma segura y acceder a tus servicios.
              LavaClean puede usar esta información para mejorar la seguridad,
              soporte e información de tus servicios de lavandería.
            </p>
          </div>

          {/* Botón continuar */}
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-[#8A6A53] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9B765C]"
          >
            Continuar
          </button>

          {/* Botón huella */}
          {/* <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#715542] py-3 text-sm font-bold text-[#E7D9C2] transition hover:bg-[#332A24]"
          >
            <Fingerprint size={18} />
            Iniciar sesión con huella
          </button> */}

          {/* Recuperar contraseña */}
          <button
            type="button"
            className="block w-full pt-4 text-center text-xs font-medium text-white/40 transition hover:text-white/70"
          >
            ¿Olvidaste tu contraseña? Recupérala aquí
          </button>
        </form>
      </section>
    </main>
  );
}
