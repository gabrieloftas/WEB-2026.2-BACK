
import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { checkConnection, prisma } from "./database/prisma.js";

try {
  await checkConnection();

  const server = app.listen(env.port, () => {
    console.log(`Servidor rodando na porta ${env.port}`);
  });

  // Encerramento organizado do servidor.
  const shutdown = async () => {
    console.log("Encerrando servidor...");

    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Não foi possível iniciar a API:", error);
  await prisma.$disconnect();
  process.exit(1);
}
