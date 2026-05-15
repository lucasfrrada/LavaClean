import {Link} from "react-router-dom";
import {User} from "lucide-react";
import {useAuth} from "../context/AuthContext";

export default function PerfilPage() {
  const {user} = useAuth();

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F5EEDC] px-6 text-[#6B4F3E]">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8]">
          <User size={28} />
        </div>

        <h1 className="mt-5 text-center text-3xl font-bold">Mis datos</h1>

        <div className="mt-8 space-y-4 text-sm">
          <div>
            <p className="font-bold text-[#7A6252]">Nombre</p>
            <p className="mt-1 rounded-lg bg-[#F5EEDC] p-3">
              {user?.nombre || "Usuario LavaClean"}
            </p>
          </div>

          <div>
            <p className="font-bold text-[#7A6252]">Correo</p>
            <p className="mt-1 rounded-lg bg-[#F5EEDC] p-3">
              {user?.email || "cliente@lavaclean.com"}
            </p>
          </div>

          <div>
            <p className="font-bold text-[#7A6252]">Teléfono</p>
            <p className="mt-1 rounded-lg bg-[#F5EEDC] p-3">
              {user?.telefono || "No registrado"}
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex w-full justify-center rounded-full bg-[#6B4F3E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
