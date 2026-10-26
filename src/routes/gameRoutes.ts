import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';

const router = Router();
const prisma = new PrismaClient();


router.get('/games', async (req, res) => {
  try {
    const { title, category } = req.query;

    const games = await prisma.jogo.findMany({
      where: {
        // Filtro opcional por título (case-insensitive se suportado ou correspondência parcial)
        titulo: title ? { contains: String(title), mode: 'insensitive' } : undefined,
        // Filtro opcional por categoria através da tabela relacional JogoCategoria
        categorias: category ? {
          some: {
            categoria: {
              categoria: { contains: String(category), mode: 'insensitive' }
            }
          }
        } : undefined
      },
      include: {
        categorias: {
          include: {
            categoria: true
          }
        }
      }
    });

    return res.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar o catálogo de jogos.' });
  }
});


router.get('/games/:id', async (req, res) => {
  try {
    const gameId = Number(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: 'ID de jogo inválido.' });
    }

    const game = await prisma.jogo.findUnique({
      where: { id: gameId },
      include: {
        categorias: {
          include: {
            categoria: true
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado.' }); // Critério de aceitação: Jogos inexistentes retorcam 404
    }

    return res.json(game);
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar o jogo.' });
  }
});

export default router;