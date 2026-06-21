ALTER TABLE servicios ADD COLUMN IF NOT EXISTS descripcion VARCHAR(1000);
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'BASE';
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS modalidad_cobro VARCHAR(30) NOT NULL DEFAULT 'POR_CARGA';
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS observaciones_cliente VARCHAR(1000);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS observaciones_internas VARCHAR(1000);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS servicio_opciones (
    id_servicio_opcion BIGSERIAL PRIMARY KEY,
    id_servicio BIGINT NOT NULL REFERENCES servicios(id_servicio),
    codigo VARCHAR(80) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio NUMERIC(12,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_servicio_opcion UNIQUE (id_servicio, codigo)
);

CREATE TABLE IF NOT EXISTS pedido_servicios (
    id_pedido_servicio BIGSERIAL PRIMARY KEY,
    id_pedido BIGINT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_servicio BIGINT NOT NULL REFERENCES servicios(id_servicio),
    tipo VARCHAR(20) NOT NULL,
    opcion_codigo VARCHAR(80),
    opcion_nombre VARCHAR(255),
    cantidad INTEGER NOT NULL DEFAULT 1,
    observaciones VARCHAR(1000),
    precio_unitario NUMERIC(12,2) NOT NULL,
    precio_estimado NUMERIC(12,2) NOT NULL,
    precio_final NUMERIC(12,2)
);

INSERT INTO pedido_servicios (
    id_pedido, id_servicio, tipo, cantidad, precio_unitario, precio_estimado, precio_final
)
SELECT p.id_pedido, MIN(d.id_servicio), 'BASE', 1,
       COALESCE(p.precio_por_carga, 0), COALESCE(p.precio_estimado, p.total, 0), p.precio_final
FROM pedidos p
JOIN detalle_pedido d ON d.id_pedido = p.id_pedido
WHERE NOT EXISTS (SELECT 1 FROM pedido_servicios ps WHERE ps.id_pedido = p.id_pedido)
GROUP BY p.id_pedido, p.precio_por_carga, p.precio_estimado, p.total, p.precio_final;

INSERT INTO servicios (tipo_servicio, precio, descripcion, tipo, modalidad_cobro, activo)
SELECT 'Lavado por Carga', 5000, 'Lavado de ropa cobrado por cargas de hasta 5 kg.', 'BASE', 'POR_CARGA', TRUE
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE LOWER(tipo_servicio) = LOWER('Lavado por Carga'));

INSERT INTO servicios (tipo_servicio, precio, descripcion, tipo, modalidad_cobro, activo)
SELECT 'Lavado de Cobertor y Sábanas de cama', 0, 'Lavado según tipo de cobertor o ropa de cama.', 'BASE', 'POR_OPCION', TRUE
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE LOWER(tipo_servicio) = LOWER('Lavado de Cobertor y Sábanas de cama'));

INSERT INTO servicios (tipo_servicio, precio, descripcion, tipo, modalidad_cobro, activo)
SELECT 'Lavado de Chaqueta', 0, 'Lavado de chaquetas según tamaño.', 'BASE', 'POR_OPCION', TRUE
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE LOWER(tipo_servicio) = LOWER('Lavado de Chaqueta'));

INSERT INTO servicio_opciones (id_servicio, codigo, nombre, precio)
SELECT s.id_servicio, v.codigo, v.nombre, v.precio
FROM servicios s
CROSS JOIN (VALUES
    ('PLUMA', 'Pluma', 12000::numeric), ('FELPA', 'Felpa', 10000::numeric),
    ('CHIPORRO', 'Chiporro', 11000::numeric), ('POLAR', 'Polar', 9000::numeric),
    ('SINTETICO', 'Sintético', 9000::numeric), ('SABANA_SIMPLE', 'Sábana simple', 5000::numeric),
    ('SABANA_DOBLE', 'Sábana doble', 7000::numeric), ('CUBRECAMA', 'Cubrecama', 10000::numeric),
    ('PLUMON', 'Plumón', 12000::numeric)
) AS v(codigo, nombre, precio)
WHERE LOWER(s.tipo_servicio) = LOWER('Lavado de Cobertor y Sábanas de cama')
ON CONFLICT (id_servicio, codigo) DO NOTHING;

INSERT INTO servicio_opciones (id_servicio, codigo, nombre, precio)
SELECT s.id_servicio, v.codigo, v.nombre, v.precio
FROM servicios s
CROSS JOIN (VALUES
    ('CORTA', 'Corta', 6000::numeric), ('MEDIANA', 'Mediana', 8000::numeric),
    ('LARGA', 'Larga', 10000::numeric)
) AS v(codigo, nombre, precio)
WHERE LOWER(s.tipo_servicio) = LOWER('Lavado de Chaqueta')
ON CONFLICT (id_servicio, codigo) DO NOTHING;

INSERT INTO servicios (tipo_servicio, precio, descripcion, tipo, modalidad_cobro, activo)
SELECT v.nombre, v.precio, v.descripcion, 'EXTRA', 'FIJO', TRUE
FROM (VALUES
    ('Quita manchas', 2500::numeric, 'Tratamiento localizado de manchas.'),
    ('Planchado a vapor', 3000::numeric, 'Planchado a vapor adicional.')
) AS v(nombre, precio, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM servicios s WHERE LOWER(s.tipo_servicio) = LOWER(v.nombre));
