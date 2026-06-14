// Manejador de errores centralizado. Normaliza la respuesta de error.
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[error]', err);
  }
  res.status(status).json({
    error: {
      message: err.message || 'Error interno',
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

// 404 para rutas no encontradas.
export function notFound(_req, res) {
  res.status(404).json({ error: { message: 'Ruta no encontrada' } });
}
