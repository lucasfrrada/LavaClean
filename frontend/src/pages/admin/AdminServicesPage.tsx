import {useEffect, useState} from "react";
import {Pencil, Plus, Trash2, WashingMachine, X} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {
  createServicioRequest,
  deleteServicioRequest,
  getServiciosRequest,
  updateServicioRequest,
} from "../../api/servicioService";
import type {Servicio} from "../../types/pedido";

const emptyForm = {
  tipoServicio: "",
  precio: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

export default function AdminServiciosPage() {
  const {token} = useAuth();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadServicios = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getServiciosRequest(token);
      setServicios(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar los servicios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServicios();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = {
        tipoServicio: form.tipoServicio,
        precio: Number(form.precio),
      };

      if (editingServicio) {
        await updateServicioRequest(editingServicio.idServicio, payload, token);
      } else {
        await createServicioRequest(payload, token);
      }

      setForm(emptyForm);
      setEditingServicio(null);
      await loadServicios();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo guardar el servicio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setForm({
      tipoServicio: servicio.tipoServicio,
      precio: servicio.precio,
    });
  };

  const handleCancelEdit = () => {
    setEditingServicio(null);
    setForm(emptyForm);
  };

  const handleDelete = async (idServicio: number) => {
    if (!token) return;

    const confirmed = confirm("¿Seguro que deseas eliminar este servicio?");
    if (!confirmed) return;

    try {
      await deleteServicioRequest(idServicio, token);
      await loadServicios();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo eliminar el servicio.");
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#6B4F3E]">
          Gestión de servicios
        </h1>
        <p className="mt-2 text-sm text-[#9A7C5F]">
          Crea, edita y administra los servicios disponibles para los pedidos.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEDC] text-[#6B4F3E]">
              <WashingMachine size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingServicio ? "Editar servicio" : "Nuevo servicio"}
              </h2>
              <p className="text-sm text-[#9A7C5F]">
                Completa los datos del servicio.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tipo de servicio"
              value={form.tipoServicio}
              onChange={(event) =>
                setForm({...form, tipoServicio: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(event) =>
                setForm({...form, precio: Number(event.target.value)})
              }
              min={0}
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
                  : editingServicio
                    ? "Actualizar"
                    : "Crear servicio"}
              </button>

              {editingServicio && (
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
              Listado de servicios
            </h2>
            <p className="mt-1 text-sm text-[#9A7C5F]">
              Total registrados: {servicios.length}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-[#9A7C5F]">Cargando servicios...</p>
          ) : servicios.length === 0 ? (
            <p className="rounded-2xl bg-[#F8F5EE] p-5 text-sm text-[#9A7C5F]">
              No hay servicios registrados todavía.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E5D8C5]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Tipo servicio</th>
                    <th className="px-5 py-4">Precio</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {servicios.map((servicio) => (
                    <tr
                      key={servicio.idServicio}
                      className="border-t border-[#E5D8C5] hover:bg-[#F8F5EE]"
                    >
                      <td className="px-5 py-4 font-bold">
                        #{servicio.idServicio}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {servicio.tipoServicio}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {formatCurrency(servicio.precio)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(servicio)}
                            className="rounded-lg bg-[#F5EEDC] p-2 text-[#6B4F3E] transition hover:bg-[#E8D8BE]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(servicio.idServicio)}
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
