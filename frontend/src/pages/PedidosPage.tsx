import {Link} from "react-router-dom";
import {ClipboardList} from "lucide-react";

export default function PedidosPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F5EEDC] px-6 text-[#6B4F3E]">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4F3E] text-[#F8EFD8]">
          <ClipboardList size={28} />
        </div>

        <h1 className="mt-5 text-center text-3xl font-bold">Mis pedidos</h1>

        <div className="mt-8 space-y-4">
          <article className="rounded-2xl border border-[#D8C7AF] bg-[#F8F5EE] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">Lavado y planchado</h2>
                <p className="mt-1 text-sm text-[#8A7161]">
                  5 prendas · Servicio a domicilio
                </p>
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Pendiente
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-[#D8C7AF] bg-[#F8F5EE] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">Ropa delicada</h2>
                <p className="mt-1 text-sm text-[#8A7161]">
                  3 prendas · Servicio express
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Completado
              </span>
            </div>
          </article>
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
