import type {Prenda, Servicio} from "../types/pedido";

const PESOS_REFERENCIA: Record<string, number> = {
  polera: 0.2,
  pantalon: 0.5,
  "ropa interior": 0.1,
  chaqueta: 1,
  sabana: 0.8,
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getPesoReferencia(prenda?: Prenda) {
  if (!prenda) return 0;
  return Number(
    prenda.pesoReferenciaKg ?? PESOS_REFERENCIA[normalizar(prenda.nombrePrenda)] ?? 0,
  );
}

export function getPrecioPorCarga(servicio?: Servicio) {
  return Number(
    servicio?.precioBase ?? servicio?.precioPorCarga ?? servicio?.precio ?? 0,
  );
}

export function getPrecioServicio(servicio?: Servicio, opcionCodigo?: string) {
  if (!servicio) return 0;
  if (servicio.modalidadCobro === "POR_OPCION") {
    return Number(
      servicio.opciones?.find((opcion) => opcion.codigo === opcionCodigo)
        ?.precio ?? 0,
    );
  }
  return getPrecioPorCarga(servicio);
}

export function getCargas(pesoKg: number) {
  return pesoKg > 0 ? Math.ceil(pesoKg / 5) : 0;
}

export function formatPeso(pesoKg: number) {
  return `${new Intl.NumberFormat("es-CL", {maximumFractionDigits: 2}).format(pesoKg)} kg`;
}
