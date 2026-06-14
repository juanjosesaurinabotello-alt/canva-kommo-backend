// Punto de entrada: arranca el servidor HTTP.
import { createApp } from './app.js';
import { config, isKommoConfigured } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  const mode = isKommoConfigured ? 'Kommo conectado' : 'MODO MOCK (sin Kommo)';
  console.log(`canva-kommo-backend escuchando en :${config.port} [${mode}]`);
});
