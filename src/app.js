// Construccion de la app Express (exportada sin escuchar, para tests).
import express from 'express';
import { config, isKommoConfigured } from './config.js';
import { unitsRouter } from './routes/units.js';
import { leadsRouter } from './routes/leads.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  // CORS minimo (necesario para builds web / Pixel Streaming).
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.corsOrigin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Healthcheck: util para monitoreo y para que la app UE5 detecte si hay
  // backend en vivo o debe caer a su cache offline.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', kommo: isKommoConfigured ? 'configured' : 'mock' });
  });

  app.use('/api/units', unitsRouter);
  app.use('/api/leads', leadsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
