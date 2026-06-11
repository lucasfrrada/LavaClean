import {useState} from "react";
import {ArrowLeft, Info} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {registerRequest} from "../api/usuarioService";
import logo from "../assets/imgs/lavaclean-icon.png";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [nombres, setNombres] = useState("");
  const [apPaterno, setApPaterno] = useState("");
  const [apMaterno, setApMaterno] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [confirmarContrasenia, setConfirmarContrasenia] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (contrasenia !== confirmarContrasenia) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (contrasenia.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await registerRequest({
        nombres: nombres.trim(),
        apPaterno: apPaterno.trim(),
        apMaterno: apMaterno.trim(),
        correo: correo.trim(),
        telefono: Number(telefono),
        contrasenia: contrasenia.trim(),
        rol: "CLIENTE",
      });

      setSuccessMessage(
        "Cuenta creada correctamente. Redirigiendo al login...",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "No se pudo crear la cuenta. Verifica los datos ingresados.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#6B4F3E] via-[#7C604B] to-[#9A7C5F] px-4 py-10 text-white">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <section className="w-full max-w-[370px] rounded-3xl bg-[#241E1A] px-7 py-8 shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2E2722] shadow-[0_0_35px_rgba(245,238,220,0.45)]">
          <img
            src={logo}
            alt="Logo LavaClean"
            className="h-16 w-16 object-contain"
          />
        </div>

        <div className="mt-7 text-center">
          <h1 className="text-xl font-bold">Crear tu cuenta de LavaClean</h1>
          <p className="mt-2 text-xs text-white/45">
            Únete y disfruta de nuestros servicios
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Nombres"
            value={nombres}
            onChange={(event) => setNombres(event.target.value)}
            required
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="text"
            placeholder="Apellido paterno"
            value={apPaterno}
            onChange={(event) => setApPaterno(event.target.value)}
            required
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="text"
            placeholder="Apellido materno"
            value={apMaterno}
            onChange={(event) => setApMaterno(event.target.value)}
            required
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="tel"
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
            required
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(event) => setContrasenia(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasenia}
            onChange={(event) => setConfirmarContrasenia(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-[#715542] bg-[#241E1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#B19072] focus:ring-2 focus:ring-[#B19072]/30"
          />

          <div className="mt-5 flex gap-3 rounded-lg bg-[#15110F] p-4 text-xs leading-relaxed text-[#C9B8A4]">
            <Info size={18} className="mt-0.5 shrink-0 text-[#D8C7AF]" />
            <p>
              Al crear una cuenta, aceptas nuestros términos de servicio y
              política de privacidad. Tu información será utilizada para
              gestionar tus servicios en LavaClean.
            </p>
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-center text-xs font-semibold text-red-300">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-lg bg-green-500/10 px-4 py-3 text-center text-xs font-semibold text-green-300">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 w-full rounded-lg bg-[#8A6A53] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9B765C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <p className="pt-3 text-center text-xs text-white/40">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-bold text-[#D8C7AF] transition hover:text-white"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
