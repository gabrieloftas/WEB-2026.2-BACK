
import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export const verifyAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token de autenticação não fornecido.",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || !token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      error: "Token mal formatado.",
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || typeof decoded.id !== "number") {
      return res.status(401).json({
        error: "Token inválido.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { administrador: true },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        error: "Usuário não encontrado ou inativo.",
      });
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      isAdmin: Boolean(usuario.administrador),
    };

    return next();
  } catch {
    return res.status(401).json({
      error: "Token inválido ou expirado.",
    });
  }
};

export const verifyAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Usuário não autenticado.",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: "Apenas administradores podem acessar este recurso.",
    });
  }

  return next();
};
