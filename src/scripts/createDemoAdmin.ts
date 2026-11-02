
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../database/prisma.js";

async function main() {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const senha = process.env.DEMO_ADMIN_PASSWORD;
  const nome = process.env.DEMO_ADMIN_NAME ?? "Administrador Demo";

  if (!email || !senha) {
    throw new Error(
      "Configure DEMO_ADMIN_EMAIL e DEMO_ADMIN_PASSWORD no .env"
    );
  }

  if (
    senha.length < 8 ||
    !/[A-Z]/.test(senha) ||
    !/[0-9]/.test(senha)
  ) {
    throw new Error(
      "A senha precisa ter 8 caracteres, uma maiúscula e um número."
    );
  }

  const emailNormalizado = email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
    include: { administrador: true },
  });

  if (existente) {
    if (existente.administrador) {
      console.log("O administrador de demonstração já existe.");
      return;
    }

    throw new Error(
      "Este e-mail já pertence a um usuário comum. Nenhuma alteração realizada."
    );
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      nome,
      email: emailNormalizado,
      senha: senhaHash,
      administrador: {
        create: {},
      },
    },
  });

  console.log("Administrador de demonstração criado com sucesso!");
}

main()
  .catch((error) => {
    console.error("Erro ao criar administrador:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
