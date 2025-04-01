import express from 'express';
import lmeController from '../controllers/lmeController.js';

const router = express.Router();

// Middleware para verificar a saúde do servidor
router.use((req, res, next) => {
    res.setHeader('X-Server-Status', 'healthy');
    next();
});

// Rota para verificar status do servidor
router.get('/health', lmeController.healthCheck);

// Rota para proxy da API LME
router.get('/api/lme', lmeController.getData);

export default router; 