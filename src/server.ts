import express from "express";
import { env } from "./config/env.js";
import { checkConnection, prisma } from "./database/prisma.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

try {
  await checkConnection();
} catch (err) {
  console.error((err as Error).message);
  await prisma.$disconnect();
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
});