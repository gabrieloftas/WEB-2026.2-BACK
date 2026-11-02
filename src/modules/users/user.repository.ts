
import bcrypt from "bcryptjs";
import { prisma } from "../../database/prisma.js";

export interface CreateUserInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento?: Date;
}

export const userRepository = {
  async create(data: CreateUserInput) {
    const senhaHash = await bcrypt.hash(data.senha, 10);

    return prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email.toLowerCase().trim(),
        senha: senhaHash,
        dataNascimento: data.dataNascimento,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        dataNascimento: true,
        ativo: true,
      },
    });
  },

  findById(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        dataNascimento: true,
        ativo: true,
      },
    });
  },

  findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  async verifyPassword(email: string, senha: string) {
    const usuario = await this.findByEmail(email);

    if (!usuario || !usuario.ativo) {
      return null;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return null;
    }

    // Não retorna a senha nem seu hash.
    const { senha: _senha, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  },
};
