// =============================================================
// Servidor básico usando Express para servir archivos estáticos
// y un archivo HTML principal para proyectos front-end.
// Compatible con ES Modules (import/export).
// =============================================================
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Servidor corriendo en http://localhost:${PORT}`);
});
