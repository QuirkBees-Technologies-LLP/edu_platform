// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app  = express();
const port = process.env.PORT || 8080;    // <- required by Azure

// ①  Static files
app.use(express.static(path.join(__dirname, 'dist')));

// ②  SPA fallback
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
);

app.listen(port, () =>
  console.log(`✅  Web server running on http://0.0.0.0:${port}`)
);
