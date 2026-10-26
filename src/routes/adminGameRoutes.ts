import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { verifyAuth, verifyAdmin } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();


router.post('/admin/games', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { titulo, descricao, categoriaNome } = req.body;

    
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ error: 'O título do jogo é obrigatório.' });
    }

    
    const novoJogo = await prisma.jogo.create({
      data: {
        titulo,
        descricao,
        categorias: categoriaNome ? {
          create: {
            categoria: {
              connectOrCreate: {
                where: { categoria: categoriaNome },
                create: { categoria: categoriaNome }
              }
            }
          }
        } : undefined
      },
      include: {
        categorias: {
          include: { categoria: true }
        }
      }
    });

    return res.status(201).json({
      message: 'Jogo cadastrado com sucesso e já publicado no catálogo!',
      jogo: novoJogo
    });
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar o jogo.' });
  }
});


router.delete('/admin/games/:id', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const gameId = Number(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: 'ID de jogo inválido.' });
    }

    
    const jogoExistente = await prisma.jogo.findUnique({
      where: { id: gameId }
    });

    if (!jogoExistente) {
      return res.status(404).json({ error: 'Jogo não encontrado para exclusão.' });
    }

    
    await prisma.jogoCategoria.deleteMany({
      where: { jogoId: gameId }
    });

    await prisma.jogo.delete({
      where: { id: gameId }
    });

    return res.json({ message: 'Jogo removido com sucesso do catálogo.' });
  } catch (error) {
    console.error('Erro ao remover jogo:', error);
    return res.status(500).json({ error: 'Erro interno ao apagar o jogo.' });
  }
});

export default router;