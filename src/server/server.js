import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import lmeRoutes from './routes/lmeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../client')));

// Rotas da API
app.use(lmeRoutes);

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 