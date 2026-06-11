import {useEffect, useState} from "react";
import {ArrowLeft, Check, Pencil, User, X} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

import {useAuth} from "../context/AuthContext";
import {updateClienteRequest} from "../api/usuarioService";
import type {UserRole} from "../types/auth";

const emptyForm = {
  nombres: "",
  apPaterno: "",
  apMaterno: "",
  correo: "",
  telefono: "",
  rol: "CLIENTE" as UserRole,
};

export default function PerfilPage() {
  const navigate = useNavigate();
  const {user, token, updateUser} = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      nombres: user.nombres ?? "",
      apPaterno: user.apPaterno ?? "",
      apMaterno: user.apMaterno ?? "",
      correo: user.correo ?? "",
      telefono: String(user.telefono ?? ""),
      rol: user.rol ?? "CLIENTE",
    });
  }, [user]);

  const handleCancelEdit = () => {
    if (!user) return;

    setForm({
      nombres: user.nombres ?? "",
      apPaterno: user.apPaterno ?? "",
      apMaterno: user.apMaterno ?? "",
      correo: user.correo ?? "",
      telefono: String(user.telefono ?? ""),
      rol: user.rol ?? "CLIENTE",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !token) {
      setErrorMessage("No se pudo identificar al usuario.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedUser = await updateClienteRequest(
        user.idUsuario,
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

      /**
       * Si tu backend al actualizar devuelve solo algunos campos,
       * usamos fallback mezclando el usuario anterior con el actualizado.
       */
      const normalizedUser = {
        ...user,
        ...updatedUser,
        nombres: updatedUser.nombres ?? form.nombres.trim(),
        apPaterno: updatedUser.apPaterno ?? form.apPaterno.trim(),
        apMaterno: updatedUser.apMaterno ?? form.apMaterno.trim(),
        correo: updatedUser.correo ?? form.correo.trim(),
        telefono: updatedUser.telefono ?? Number(form.telefono),
        rol: updatedUser.rol ?? form.rol,
      };

      updateUser(normalizedUser);

      setSuccessMessage("Tus datos fueron actualizados correctamente.");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "No se pudieron actualizar tus datos. Verifica si el correo o teléfono ya están registrados.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F5EEDC] px-6 text-[#6B4F3E]">
        <section className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold">No has iniciado sesión</h1>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-[#6B4F3E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334]"
          >
            Iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F5EEDC] text-[#6B4F3E]">
      <header className="fixed left-0 top-0 z-50 w-full bg-[#6B4F3E] shadow-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <Link to="/" className="text-xl font-bold text-white">
            LavaClean
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

      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-28">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B4F3E] text-[#F8EFD8]">
                <User size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-[#6B4F3E]">Mis datos</h1>
                <p className="mt-1 text-sm text-[#9A7C5F]">
                  Revisa y actualiza tu información personal.
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B4F3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5A4334]"
              >
                <Pencil size={17} />
                Editar datos
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D8C7AF] px-5 py-3 text-sm font-bold text-[#6B4F3E] transition hover:bg-[#F5EEDC]"
              >
                <X size={17} />
                Cancelar
              </button>
            )}
          </div>

          {errorMessage && (
            <p className="mb-6 rounded-xl bg-red-100 px-5 py-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mb-6 rounded-xl bg-green-100 px-5 py-4 text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileInput
              label="Nombres"
              value={form.nombres}
              disabled={!isEditing}
              onChange={(value) => setForm({...form, nombres: value})}
            />

            <ProfileInput
              label="Apellido paterno"
              value={form.apPaterno}
              disabled={!isEditing}
              onChange={(value) => setForm({...form, apPaterno: value})}
            />

            <ProfileInput
              label="Apellido materno"
              value={form.apMaterno}
              disabled={!isEditing}
              onChange={(value) => setForm({...form, apMaterno: value})}
            />

            <ProfileInput
              label="Correo electrónico"
              type="email"
              value={form.correo}
              disabled={!isEditing}
              onChange={(value) => setForm({...form, correo: value})}
            />

            <ProfileInput
              label="Teléfono"
              type="tel"
              value={form.telefono}
              disabled={!isEditing}
              onChange={(value) => setForm({...form, telefono: value})}
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={isSaving}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6B4F3E] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#5A4334] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={18} />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

type ProfileInputProps = {
  label: string;
  value: string;
  disabled: boolean;
  type?: string;
  onChange: (value: string) => void;
};

function ProfileInput({
  label,
  value,
  disabled,
  type = "text",
  onChange,
}: ProfileInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#7A6252]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        required
        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
          disabled
            ? "border-[#E5D8C5] bg-[#F8F5EE] text-[#8A7161]"
            : "border-[#D8C7AF] bg-[#F5EEDC] text-[#6B4F3E] focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
        }`}
      />
    </div>
  );
}
