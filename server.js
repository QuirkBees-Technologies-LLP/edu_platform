import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "dist")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

app.get("*", (req, res, next) => {
  const indexPath = path.join(__dirname, "dist", "index.html");

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("SPA index.html serving failed:", {
        path: indexPath,
        code: err.code,
        message: err.message,
        url: req.originalUrl,
        pid: process.pid,
        timestamp: new Date().toISOString(),
      });

      if (!res.headersSent) {
        next(err);
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

