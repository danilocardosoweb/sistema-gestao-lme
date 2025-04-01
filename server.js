import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Cache para armazenar os últimos dados obtidos
let dataCache = {
    timestamp: null,
    data: null,
    expirationTime: 5 * 60 * 1000 // 5 minutos
};

// Função para buscar dados com retry
async function fetchDataWithRetry(retries = MAX_RETRIES) {
    try {
        const response = await fetch('https://lme.gorilaxpress.com/cotacao/2cf4ff0e-8a30-48a5-8add-f4a1a63fee10/json/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Atualizar cache
        dataCache = {
            timestamp: Date.now(),
            data: data,
            expirationTime: 5 * 60 * 1000
        };
        
        return data;
    } catch (error) {
        if (retries > 0) {
            console.log(`Tentativa falhou, tentando novamente em ${RETRY_DELAY}ms. Tentativas restantes: ${retries-1}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchDataWithRetry(retries - 1);
        }
        throw error;
    }
}

// Habilitar CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://sistema-gestao-lme.vercel.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Server-Status'],
    credentials: true
}));

// Adicionar headers de segurança
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Server-Status');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Middleware para verificar a saúde do servidor
app.use((req, res, next) => {
    res.setHeader('X-Server-Status', 'healthy');
    next();
});

// Rota para verificar status do servidor
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Rota para proxy da API LME
app.get('/api/lme', async (req, res) => {
    try {
        // Verificar se temos dados em cache válidos
        if (dataCache.data && dataCache.timestamp && 
            (Date.now() - dataCache.timestamp) < dataCache.expirationTime) {
            return res.json(dataCache.data);
        }

        const data = await fetchDataWithRetry();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        
        // Se temos dados em cache, mesmo que expirados, retornar como fallback
        if (dataCache.data) {
            res.setHeader('X-Data-Source', 'cache');
            return res.json(dataCache.data);
        }
        
        res.status(500).json({ 
            error: 'Erro ao buscar dados da API',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

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