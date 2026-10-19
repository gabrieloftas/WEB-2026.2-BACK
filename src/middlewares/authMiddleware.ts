import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_temporario_dev';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}


export const verifyAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { administrador: true } 
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

   
    req.user = {
      id: usuario.id,
      email: usuario.email,
      isAdmin: !!usuario.administrador 
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};


export const verifyAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
    });
  }

  return next();
};