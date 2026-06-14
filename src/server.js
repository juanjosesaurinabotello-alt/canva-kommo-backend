// Punto de entrada: arranca el servidor HTTP.
import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`canva-kommo-backend escuchando en :${config.port}`);
});
