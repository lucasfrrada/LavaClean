# Ejemplos de API de pedidos

Los IDs son referenciales; deben reemplazarse por los obtenidos desde `GET /api/servicios/base` y `GET /api/servicios/extras`.

## Lavado por carga con extras

`POST /api/pedidos`

```json
{
  "idUsuario": 1,
  "fecha_llegada": "2026-06-20",
  "fecha_entrega": "2026-06-22",
  "idServicioBase": 1,
  "observacionesCliente": "Separar prendas blancas",
  "detalles": [
    {"idPrenda": 1, "cantidad": 10, "observaciones": "Poleras"},
    {"idPrenda": 2, "cantidad": 4, "observaciones": "Pantalones con manchas"}
  ],
  "serviciosExtras": [
    {"idServicio": 4, "cantidad": 1, "observaciones": "Mancha de vino"},
    {"idServicio": 5, "cantidad": 1}
  ]
}
```

## Cobertor o ropa de cama

```json
{
  "idUsuario": 1,
  "fecha_llegada": "2026-06-20",
  "fecha_entrega": "2026-06-24",
  "idServicioBase": 2,
  "opcionBaseCodigo": "PLUMON",
  "observacionesServicioBase": "Plumón king, relleno sintético",
  "detalles": [],
  "serviciosExtras": []
}
```

## Lavado de chaqueta

```json
{
  "idUsuario": 1,
  "fecha_llegada": "2026-06-20",
  "fecha_entrega": "2026-06-23",
  "idServicioBase": 3,
  "opcionBaseCodigo": "LARGA",
  "observacionesServicioBase": "Chaqueta impermeable",
  "serviciosExtras": [{"idServicio": 4, "cantidad": 1}]
}
```

## Confirmar peso real

`PATCH /api/pedidos/15/confirmar-peso`

```json
{"pesoRealKg": 5.5}
```

## Cambiar estado

`PATCH /api/pedidos/15/estado`

```json
{"estado": "EN_PROCESO"}
```
