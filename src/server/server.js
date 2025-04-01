import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import lmeRoutes from './routes/lmeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Habilitar CORS com opções específicas para o Vercel
app.use(cors({
    origin: process.env.VERCEL_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir arquivos estáticos
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../dist')));
} else {
    app.use(express.static(path.join(__dirname, '../client')));
}

// Rotas da API
app.use('/api', lmeRoutes);

// Rota para servir o index.html em produção
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
}

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Exportar para uso com serverless
export default app;

// Iniciar servidor apenas se não estiver no Vercel
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
} 