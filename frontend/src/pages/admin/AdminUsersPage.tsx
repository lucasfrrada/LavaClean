import {useEffect, useState} from "react";
import {Pencil, Plus, Trash2, UserRound, X} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {
  createClienteRequest,
  deleteClienteRequest,
  getUsuariosRequest,
  updateClienteRequest,
} from "../../api/usuarioService";
import type {AuthUser, UserRole} from "../../types/auth";

const emptyForm = {
  nombres: "",
  apPaterno: "",
  apMaterno: "",
  correo: "",
  telefono: "",
  contrasenia: "",
  rol: "CLIENTE" as UserRole,
};

export default function AdminUsersPage() {
  const {token, user} = useAuth();

  const [clientes, setClientes] = useState<AuthUser[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCliente, setEditingCliente] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadClientes = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getUsuariosRequest(token);

      // Si quieres mostrar solo clientes y no administradores:
      const onlyClientes = data.filter((usuario) => usuario.rol === "CLIENTE");

      setClientes(onlyClientes);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar los clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    if (!editingCliente && form.contrasenia.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editingCliente) {
        await updateClienteRequest(
          editingCliente.idUsuario,
          {
            nombres: form.nombres.trim(),
            apPaterno: form.apPaterno.trim(),
            apMaterno: form.apMaterno.trim(),
            correo: form.correo.trim(),
            telefono: Number(form.telefono),
            rol: form.rol,
          },
          token,
        );
      } else {
        await createClienteRequest(
          {
            nombres: form.nombres.trim(),
            apPaterno: form.apPaterno.trim(),
            apMaterno: form.apMaterno.trim(),
            correo: form.correo.trim(),
            telefono: Number(form.telefono),
            contrasenia: form.contrasenia.trim(),
            rol: form.rol,
          },
          token,
        );
      }

      setForm(emptyForm);
      setEditingCliente(null);
      await loadClientes();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "No se pudo guardar el cliente. Verifica correo o teléfono duplicado.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cliente: AuthUser) => {
    setEditingCliente(cliente);

    setForm({
      nombres: cliente.nombres,
      apPaterno: cliente.apPaterno,
      apMaterno: cliente.apMaterno,
      correo: cliente.correo,
      telefono: String(cliente.telefono),
      contrasenia: "",
      rol: cliente.rol ?? "CLIENTE",
    });
  };

  const handleCancelEdit = () => {
    setEditingCliente(null);
    setForm(emptyForm);
  };

  const handleDelete = async (idUsuario: number) => {
    if (!token) return;

    if (user?.idUsuario === idUsuario) {
      setErrorMessage("No puedes eliminar tu propio usuario.");
      return;
    }

    const confirmed = confirm("¿Seguro que deseas eliminar este cliente?");

    if (!confirmed) return;

    try {
      setErrorMessage("");
      await deleteClienteRequest(idUsuario, token);
      await loadClientes();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo eliminar el cliente.");
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#6B4F3E]">
          Gestión de clientes
        </h1>

        <p className="mt-2 text-sm text-[#9A7C5F]">
          Crea, edita y administra los clientes registrados en LavaClean.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EEDC] text-[#6B4F3E]">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editingCliente ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p className="text-sm text-[#9A7C5F]">
                Completa los datos del cliente.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombres"
              value={form.nombres}
              onChange={(event) =>
                setForm({...form, nombres: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="text"
              placeholder="Apellido paterno"
              value={form.apPaterno}
              onChange={(event) =>
                setForm({...form, apPaterno: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="text"
              placeholder="Apellido materno"
              value={form.apMaterno}
              onChange={(event) =>
                setForm({...form, apMaterno: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.correo}
              onChange={(event) =>
                setForm({...form, correo: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            <input
              type="tel"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(event) =>
                setForm({...form, telefono: event.target.value})
              }
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            />

            {!editingCliente && (
              <input
                type="password"
                placeholder="Contraseña"
                value={form.contrasenia}
                onChange={(event) =>
                  setForm({...form, contrasenia: event.target.value})
                }
                required
                minLength={8}
                className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
              />
            )}

            <select
              value={form.rol}
              onChange={(event) =>
                setForm({...form, rol: event.target.value as UserRole})
              }
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
            >
              <option value="CLIENTE">Cliente</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>

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
                  : editingCliente
                    ? "Actualizar"
                    : "Crear cliente"}
              </button>

              {editingCliente && (
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
              Listado de clientes
            </h2>

            <p className="mt-1 text-sm text-[#9A7C5F]">
              Total registrados: {clientes.length}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-[#9A7C5F]">Cargando clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="rounded-2xl bg-[#F8F5EE] p-5 text-sm text-[#9A7C5F]">
              No hay clientes registrados todavía.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E5D8C5]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Contacto</th>
                    <th className="px-5 py-4">Rol</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((cliente) => (
                    <tr
                      key={cliente.idUsuario}
                      className="border-t border-[#E5D8C5] hover:bg-[#F8F5EE]"
                    >
                      <td className="px-5 py-4 font-bold">
                        #{cliente.idUsuario}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold">
                          {cliente.nombres} {cliente.apPaterno}
                        </p>
                        <p className="mt-1 text-xs text-[#8A7161]">
                          {cliente.apMaterno}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">{cliente.correo}</p>
                        <p className="mt-1 text-xs text-[#8A7161]">
                          {cliente.telefono}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            cliente.rol === "ADMINISTRADOR"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {cliente.rol}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(cliente)}
                            className="rounded-lg bg-[#F5EEDC] p-2 text-[#6B4F3E] transition hover:bg-[#E8D8BE]"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cliente.idUsuario)}
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
