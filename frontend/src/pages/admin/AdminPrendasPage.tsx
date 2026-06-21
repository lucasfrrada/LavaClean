import {useEffect, useState} from "react";
import {Pencil, Plus, Shirt, Trash2, X} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {
  createPrendaRequest,
  deletePrendaRequest,
  getPrendasRequest,
  updatePrendaRequest,
} from "../../api/prendaService";
import type {Prenda} from "../../types/pedido";

const emptyForm = {
  nombrePrenda: "",
  categoria: "",
  pesoReferenciaKg: 0.1,
};

export default function AdminPrendasPage() {
  const {token} = useAuth();

  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPrenda, setEditingPrenda] = useState<Prenda | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPrendas = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getPrendasRequest(token);
      setPrendas(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar las prendas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrendas();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editingPrenda) {
        await updatePrendaRequest(editingPrenda.idPrenda, form, token);
      } else {
        await createPrendaRequest(form, token);
      }

      setForm(emptyForm);
      setEditingPrenda(null);
      await loadPrendas();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo guardar la prenda.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (prenda: Prenda) => {
    setEditingPrenda(prenda);
    setForm({
      nombrePrenda: prenda.nombrePrenda,
      categoria: prenda.categoria,
      pesoReferenciaKg: Number(prenda.pesoReferenciaKg ?? 0),
    });
  };

  const handleCancelEdit = () => {
    setEditingPrenda(null);
    setForm(emptyForm);
  };

  const handleDelete = async (idPrenda: number) => {
    if (!token) return;

    const confirmed = confirm("¿Seguro que deseas eliminar esta prenda?");
    if (!confirmed) return;

    try {
      await deletePrendaRequest(idPrenda, token);
      await loadPrendas();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo eliminar la prenda.");
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#6B4F3E]">
          Gestión de prendas
        </h1>
        <p className="mt-2 text-sm text-[#9A7C5F]">
          Crea, edita y administra las prendas disponibles para los pedidos.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEDC] text-[#6B4F3E]">
              <Shirt size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingPrenda ? "Editar prenda" : "Nueva prenda"}
              </h2>
              <p className="text-sm text-[#9A7C5F]">
                Completa los datos de la prenda.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de la prenda"
              value={form.nombrePrenda}
              onChange={(event) =>
                setForm({...form, nombrePrenda: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="text"
              placeholder="Categoría"
              value={form.categoria}
              onChange={(event) =>
                setForm({...form, categoria: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="number"
              min="0.001"
              step="0.001"
              placeholder="Peso de referencia (kg)"
              value={form.pesoReferenciaKg}
              onChange={(event) =>
                setForm({...form, pesoReferenciaKg: Number(event.target.value)})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            {errorMessage && (
              <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6B4F3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334] disabled:opacity-60"
              >
                <Plus size={18} />
                {isSaving
                  ? "Guardando..."
                  : editingPrenda
                    ? "Actualizar"
                    : "Crear prenda"}
              </button>

              {editingPrenda && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center rounded-lg border border-[#D8C7AF] px-4 py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-[#F5EEDC]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#6B4F3E]">
              Listado de prendas
            </h2>
            <p className="mt-1 text-sm text-[#9A7C5F]">
              Total registradas: {prendas.length}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-[#9A7C5F]">Cargando prendas...</p>
          ) : prendas.length === 0 ? (
            <p className="rounded-2xl bg-[#F8F5EE] p-5 text-sm text-[#9A7C5F]">
              No hay prendas registradas todavía.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E5D8C5]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Nombre prenda</th>
                    <th className="px-5 py-4">Categoría</th>
                    <th className="px-5 py-4">Peso ref.</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {prendas.map((prenda) => (
                    <tr
                      key={prenda.idPrenda}
                      className="border-t border-[#E5D8C5] hover:bg-[#F8F5EE]"
                    >
                      <td className="px-5 py-4 font-bold">
                        #{prenda.idPrenda}
                      </td>
                      <td className="px-5 py-4 font-bold">
                        {prenda.nombrePrenda}
                      </td>
                      <td className="px-5 py-4 text-[#8A7161]">
                        {prenda.categoria}
                      </td>
                      <td className="px-5 py-4 text-[#8A7161]">
                        {Number(prenda.pesoReferenciaKg ?? 0).toLocaleString("es-CL")} kg
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(prenda)}
                            className="rounded-lg bg-[#F5EEDC] p-2 text-[#6B4F3E] transition hover:bg-[#E8D8BE]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(prenda.idPrenda)}
                            className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
