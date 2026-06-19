import {useEffect, useMemo, useState} from "react";
import {Package, Plus, RefreshCcw, ArrowDownUp} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {
  createMovimientoRequest,
  createProductoRequest,
  getMovimientosRequest,
  getProductosRequest,
} from "../../api/inventarioService";
import type {
  MovimientoInventario,
  Producto,
  TipoMovimientoInventario,
} from "../../types/inventario";

const emptyProductoForm = {
  nombreProducto: "",
  descripcion: "",
  stock: "",
  stockMinimo: "",
  unidadMedida: "",
};

const emptyMovimientoForm = {
  idProducto: 0,
  tipoMovimiento: "ENTRADA" as TipoMovimientoInventario,
  cantidad: 1,
  motivo: "",
};

export default function AdminInventarioPage() {
  const {token} = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [productoForm, setProductoForm] = useState(emptyProductoForm);
  const [movimientoForm, setMovimientoForm] = useState(emptyMovimientoForm);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProducto, setIsSavingProducto] = useState(false);
  const [isSavingMovimiento, setIsSavingMovimiento] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInventario = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const [productosData, movimientosData] = await Promise.all([
        getProductosRequest(token),
        getMovimientosRequest(token),
      ]);

      setProductos(productosData);
      setMovimientos(movimientosData);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo cargar el inventario.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventario();
  }, [token]);

  const productosBajoStock = useMemo(() => {
    return productos.filter(
      (producto) =>
        producto.estado === "BAJO_STOCK" ||
        producto.estado === "AGOTADO" ||
        Number(producto.stock) <= Number(producto.stockMinimo),
    ).length;
  }, [productos]);

  const handleCreateProducto = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) return;

    try {
      setIsSavingProducto(true);
      setErrorMessage("");

      await createProductoRequest(
        {
          nombreProducto: productoForm.nombreProducto.trim(),
          descripcion: productoForm.descripcion.trim(),
          stock: Number(productoForm.stock),
          stockMinimo: Number(productoForm.stockMinimo),
          unidadMedida: productoForm.unidadMedida.trim(),
        },
        token,
      );

      setProductoForm(emptyProductoForm);
      await loadInventario();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo crear el producto.");
    } finally {
      setIsSavingProducto(false);
    }
  };

  const handleCreateMovimiento = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) return;

    if (!movimientoForm.idProducto) {
      setErrorMessage("Debes seleccionar un producto.");
      return;
    }

    try {
      setIsSavingMovimiento(true);
      setErrorMessage("");

      await createMovimientoRequest(
        {
          idProducto: Number(movimientoForm.idProducto),
          tipoMovimiento: movimientoForm.tipoMovimiento,
          cantidad: Number(movimientoForm.cantidad),
          motivo: movimientoForm.motivo.trim(),
        },
        token,
      );

      setMovimientoForm(emptyMovimientoForm);
      await loadInventario();
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo registrar el movimiento.");
    } finally {
      setIsSavingMovimiento(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#6B4F3E]">
            Gestión de inventario
          </h1>
          <p className="mt-2 text-sm text-[#9A7C5F]">
            Administra productos, stock y movimientos de inventario.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventario}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B4F3E] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#5A4334] disabled:opacity-60"
        >
          <RefreshCcw size={17} />
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Productos registrados"
          value={String(productos.length)}
          icon={Package}
        />
        <DashboardCard
          title="Bajo stock / agotados"
          value={String(productosBajoStock)}
          icon={ArrowDownUp}
        />
        <DashboardCard
          title="Movimientos"
          value={String(movimientos.length)}
          icon={RefreshCcw}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <form
          onSubmit={handleCreateProducto}
          className="rounded-2xl bg-white p-6 shadow-md"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#F5EEDC] p-3 text-[#6B4F3E]">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#6B4F3E]">
                Nuevo producto
              </h2>
              <p className="text-sm text-[#9A7C5F]">
                Crea un insumo para controlar su stock.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={productoForm.nombreProducto}
              onChange={(event) =>
                setProductoForm({
                  ...productoForm,
                  nombreProducto: event.target.value,
                })
              }
              placeholder="Nombre producto"
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
            />

            <input
              value={productoForm.descripcion}
              onChange={(event) =>
                setProductoForm({
                  ...productoForm,
                  descripcion: event.target.value,
                })
              }
              placeholder="Descripción"
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#6B4F3E]">
                  Stock
                </label>

                <input
                  type="number"
                  min={0}
                  value={productoForm.stock}
                  onChange={(event) =>
                    setProductoForm({
                      ...productoForm,
                      stock: event.target.value,
                    })
                  }
                  placeholder="Ej: 10"
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#6B4F3E]">
                  Stock mínimo
                </label>

                <input
                  type="number"
                  min={0}
                  value={productoForm.stockMinimo}
                  onChange={(event) =>
                    setProductoForm({
                      ...productoForm,
                      stockMinimo: event.target.value,
                    })
                  }
                  placeholder="Ej: 3"
                  required
                  className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53] focus:ring-2 focus:ring-[#8A6A53]/20"
                />
              </div>
            </div>

            <input
              value={productoForm.unidadMedida}
              onChange={(event) =>
                setProductoForm({
                  ...productoForm,
                  unidadMedida: event.target.value,
                })
              }
              placeholder="Unidad de medida: unidad, litro, kilo..."
              required
              className="w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
            />

            <button
              type="submit"
              disabled={isSavingProducto}
              className="w-full rounded-xl bg-[#6B4F3E] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5A4334] disabled:opacity-60"
            >
              {isSavingProducto ? "Guardando..." : "Crear producto"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-[#6B4F3E]">
            Listado de productos
          </h2>
          <p className="mt-1 text-sm text-[#9A7C5F]">
            Total registrados: {productos.length}
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F5EEDC] text-[#6B4F3E]">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Mínimo</th>
                  <th className="px-4 py-3">Unidad</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr
                    key={producto.idProducto}
                    className="border-b border-[#E8D8BE]"
                  >
                    <td className="px-4 py-3 font-semibold text-[#6B4F3E]">
                      {producto.nombreProducto}
                    </td>
                    <td className="px-4 py-3">{producto.stock}</td>
                    <td className="px-4 py-3">{producto.stockMinimo}</td>
                    <td className="px-4 py-3">{producto.unidadMedida}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getEstadoClass(producto.estado)}`}
                      >
                        {producto.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && productos.length === 0 && (
              <p className="py-8 text-center text-sm text-[#9A7C5F]">
                No hay productos registrados todavía.
              </p>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateMovimiento}
        className="rounded-2xl bg-white p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-[#6B4F3E]">
          Registrar movimiento
        </h2>
        <p className="mt-1 text-sm text-[#9A7C5F]">
          Usa esto para entradas, salidas o ajustes manuales de stock.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <select
            value={movimientoForm.idProducto}
            onChange={(event) =>
              setMovimientoForm({
                ...movimientoForm,
                idProducto: Number(event.target.value),
              })
            }
            required
            className="rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
          >
            <option value={0}>Seleccionar producto</option>
            {productos.map((producto) => (
              <option key={producto.idProducto} value={producto.idProducto}>
                {producto.nombreProducto}
              </option>
            ))}
          </select>

          <select
            value={movimientoForm.tipoMovimiento}
            onChange={(event) =>
              setMovimientoForm({
                ...movimientoForm,
                tipoMovimiento: event.target.value as TipoMovimientoInventario,
              })
            }
            className="rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste</option>
          </select>

          <input
            type="number"
            min={0.01}
            step="0.01"
            value={movimientoForm.cantidad}
            onChange={(event) =>
              setMovimientoForm({
                ...movimientoForm,
                cantidad: Number(event.target.value),
              })
            }
            className="rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
          />

          <button
            type="submit"
            disabled={isSavingMovimiento}
            className="rounded-xl bg-[#6B4F3E] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5A4334] disabled:opacity-60"
          >
            {isSavingMovimiento ? "Registrando..." : "Registrar"}
          </button>
        </div>

        <input
          value={movimientoForm.motivo}
          onChange={(event) =>
            setMovimientoForm({
              ...movimientoForm,
              motivo: event.target.value,
            })
          }
          placeholder="Motivo del movimiento"
          className="mt-4 w-full rounded-lg border border-[#D8C7AF] bg-[#F5EEDC] px-4 py-3 text-sm outline-none focus:border-[#8A6A53]"
        />
      </form>
    </section>
  );
}

type DashboardCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
};

function DashboardCard({title, value, icon: Icon}: DashboardCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#9A7C5F]">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-[#6B4F3E]">{value}</h3>
        </div>
        <div className="rounded-xl bg-[#F5EEDC] p-3 text-[#6B4F3E]">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function getEstadoClass(estado: string) {
  const classes: Record<string, string> = {
    ACTIVO: "bg-green-100 text-green-700",
    INACTIVO: "bg-gray-100 text-gray-700",
    BAJO_STOCK: "bg-yellow-100 text-yellow-700",
    AGOTADO: "bg-red-100 text-red-700",
  };

  return classes[estado] ?? "bg-gray-100 text-gray-700";
}
