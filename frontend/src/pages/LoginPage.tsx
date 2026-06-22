import {useState} from "react";
import {ArrowLeft, Info} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {loginRequest} from "../api/authService";
import logo from "../assets/imgs/lavaclean-icon.png";
import {AnimatePresence} from "motion/react";
import SuccessScreen from "../components/SuccessScreen";

export default function LoginPage() {
  const navigate = useNavigate();
  const {login} = useAuth();

  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasena] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await loginRequest({
        correo: correo.trim(),
        contrasenia: contrasenia.trim(),
      });

      console.log("Respuesta login:", response);

      const user = {
        idUsuario: response.idUsuario,
        nombres: response.nombres,
        apPaterno: response.apPaterno,
        apMaterno: response.apMaterno,
        correo: response.correo,
        telefono: response.telefono,
        rol: response.rol,
      };

      setShowSuccess(true);

      setTimeout(() => {
        login(user, response.token);

        if (user.rol === "ADMINISTRADOR") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Correo o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessScreen
            title="Inicio de sesión exitoso"
            message="Bienvenido a LavaClean. Estamos ingresando a tu cuenta."
          />
        )}
      </AnimatePresence>
      <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0F172A] px-4 py-10 text-white">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <section className="w-full max-w-[370px] rounded-3xl border border-[#DBEAFE] bg-white px-7 py-8 text-[#111827] shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center bg-white">
            <img
              src={logo}
              alt="Logo LavaClean"
              className="h-16 w-16 object-contain"
            />
          </div>

          <h1 className="mt-7 text-center text-xl font-bold">
            Iniciar sesión en LavaClean
          </h1>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              required
              className="w-full rounded-lg border border-[#BFDBFE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#64748B] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={contrasenia}
              onChange={(event) => setContrasena(event.target.value)}
              required
              className="w-full rounded-lg border border-[#BFDBFE] bg-[#F8FAFC] px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#64748B] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <Link
              to="/register"
              className="block w-full pt-2 text-center text-xs font-semibold text-[#2563EB] transition hover:text-[#1E40AF]"
            >
              Crear tu cuenta de LavaClean
            </Link>

            <div className="mt-5 flex gap-3 rounded-lg bg-[#EFF6FF] p-4 text-xs leading-relaxed text-[#1E3A8A]">
              <Info size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
              <p>
                La información de tu cuenta se usa para iniciar sesión de forma
                segura y acceder a tus servicios.
              </p>
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || showSuccess}
              className="mt-5 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {showSuccess
                ? "Ingresando..."
                : isLoading
                  ? "Validando..."
                  : "Iniciar sesión"}
            </button>

            {/* <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1E40AF] py-3 text-sm font-bold text-[#DBEAFE] transition hover:bg-[#1E293B]"
          >
            <Fingerprint size={18} />
            Iniciar sesión con huella
          </button> */}
          </form>
        </section>
      </main>
    </>
  );
}
