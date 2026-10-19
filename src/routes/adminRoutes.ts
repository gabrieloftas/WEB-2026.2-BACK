import { Router } from 'express';
import { verifyAuth, verifyAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/admin/jogos', verifyAuth, verifyAdmin, async (req, res) => {
  return res.status(201).json({ message: 'Jogo cadastrado com sucesso pelo administrador!' });
});

export default router;