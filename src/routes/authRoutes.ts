
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";
import { env } from "../config/env.js";

const router = Router();

// Cadastro de usuário
router.post("/auth/register", async (req, res) => {
  try {
    const { nome, email, senha, dataNascimento } = req.body;

    // Validação dos campos
    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !nome.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        error: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailNormalizado
    );

    if (!emailValido) {
      return res.status(400).json({
        error: "Informe um e-mail válido.",
      });
    }

    // Mínimo 8 caracteres, uma maiúscula e um número.
    const senhaValida =
      senha.length >= 8 &&
      /[A-Z]/.test(senha) &&
      /[0-9]/.test(senha);

    if (!senhaValida) {
      return res.status(400).json({
        error:
          "A senha deve possuir pelo menos 8 caracteres, uma letra maiúscula e um número.",
      });
    }

    if (nome.trim().length > 100) {
      return res.status(400).json({
        error: "O nome deve possuir no máximo 100 caracteres.",
      });
    }

    if (emailNormalizado.length > 100) {
      return res.status(400).json({
        error: "O e-mail deve possuir no máximo 100 caracteres.",
      });
    }

    // Verifica se o e-mail já existe.
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        error: "Este e-mail já está cadastrado.",
      });
    }

    // Gera o hash da senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    let nascimento: Date | undefined;

    if (dataNascimento !== undefined) {
      if (
        typeof dataNascimento !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)
      ) {
        return res.status(400).json({
          error: "Data de nascimento inválida.",
        });
      }

      const data = new Date(`${dataNascimento}T00:00:00.000Z`);

      if (
        Number.isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== dataNascimento
      ) {
        return res.status(400).json({
          error: "Data de nascimento inválida.",
        });
      }

      nascimento = data;
    }

    // Cria o usuário e seu perfil de cliente.
    const usuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaHash,
        dataNascimento: nascimento,
        cliente: {
          create: {},
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        dataNascimento: true,
      },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario,
    });
  } catch (error) {
    // Protege contra cadastros simultâneos com o mesmo e-mail.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "Este e-mail já está cadastrado.",
      });
    }

    console.error("Erro no cadastro:", error);

    return res.status(500).json({
      error: "Não foi possível realizar o cadastro.",
    });
  }
});

// Login de usuário
router.post("/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return res.status(400).json({
        error: "E-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      include: {
        administrador: true,
      },
    });

    // Mensagem genérica para evitar revelar se o e-mail existe.
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        error: "E-mail ou senha incorretos.",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        error: "E-mail ou senha incorretos.",
      });
    }

    const isAdmin = Boolean(usuario.administrador);

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        isAdmin,
      },
      env.jwtSecret,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      error: "Não foi possível realizar o login.",
    });
  }
});

export default router;
