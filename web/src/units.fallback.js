// Datos de respaldo offline: espejo del seed del backend.
// Se usan si el backend no esta disponible (feria sin internet), para que
// la experiencia nunca se rompa.
export const FALLBACK_UNITS = [
  { unitId: 'UNIT_101', tipologia: '1 dormitorio + balcon', areaM2: 48.5, precio: 'USD 119.000', estado: 'available', formaPago: '30% entrega + 24 cuotas', imagen: '' },
  { unitId: 'UNIT_102', tipologia: '2 dormitorios', areaM2: 67.0, precio: 'USD 165.000', estado: 'available', formaPago: '40% entrega + 18 cuotas', imagen: '' },
  { unitId: 'UNIT_103', tipologia: '2 dormitorios + parrillero', areaM2: 72.3, precio: 'USD 184.000', estado: 'reserved', formaPago: '30% entrega + 36 cuotas', imagen: '' },
  { unitId: 'UNIT_104', tipologia: '3 dormitorios vista al mar', areaM2: 95.8, precio: 'USD 268.000', estado: 'sold', formaPago: 'Contado / financiacion bancaria', imagen: '' },
  { unitId: 'UNIT_105', tipologia: 'Penthouse 3 dormitorios', areaM2: 128.0, precio: 'USD 395.000', estado: 'available', formaPago: '50% entrega + 12 cuotas', imagen: '' },
];
