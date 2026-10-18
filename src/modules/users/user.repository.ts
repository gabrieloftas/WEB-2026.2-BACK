import { prisma } from "../../database/prisma.js";

export interface CreateUserInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento?: Date;
}

export const userRepository = {
  create(data: CreateUserInput) {
    return prisma.usuario.create({ data });
  },

  findById(id: number) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },
};
