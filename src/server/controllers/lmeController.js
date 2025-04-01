import lmeService from '../services/lmeService.js';

class LMEController {
    async getData(req, res) {
        try {
            const data = await lmeService.getData();
            res.json(data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            res.status(500).json({ 
                error: 'Erro ao buscar dados da API',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    healthCheck(req, res) {
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString() 
        });
    }
}

export default new LMEController(); 