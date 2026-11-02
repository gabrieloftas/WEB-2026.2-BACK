import authRoutes from "./routes/authRoutes.js";
import express, { type NextFunction, type Request, type Response } from "express";
import gameRoutes from "./routes/gameRoutes.js";
import adminGameRoutes from "./routes/adminGameRoutes.js";


const app = express();

// Permite requisições JSON.
app.use(express.json());

// CORS básico para permitir a integração com o frontend.
// Em desenvolvimento, permite qualquer origem.
// Em produção, configure FRONTEND_URL no .env.
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigin = process.env.FRONTEND_URL;
  const origin = req.headers.origin;

  if (!allowedOrigin || origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Verificação básica da API.
import { checkConnection } from "./database/prisma.js";

app.get("/health", async (_req, res) => {
  try {
    await checkConnection();

    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});

// Rotas já existentes no projeto.
app.use(authRoutes);
app.use("/api", gameRoutes);
app.use("/api", adminGameRoutes);

// Rota inicial.
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API funcionando!" });
});

// Rota inexistente.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

// Tratamento básico de erros.
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("Erro na API:", err.message);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({ error: "Erro interno do servidor." });
  }
);

export default app;
