import fetch from 'node-fetch';
import cacheService from './cacheService.js';
import ptaxService from './ptaxService.js';

class LMEService {
    constructor() {
        this.baseUrl = 'https://lme.gorilaxpress.com/cotacao/2cf4ff0e-8a30-48a5-8add-f4a1a63fee10/json/';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 segundo
    }

    async fetchDataWithRetry(retries = this.maxRetries) {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Enriquecer dados com PTAX
            const enrichedData = await ptaxService.enrichDataWithPTAX(data);
            
            // Atualizar cache
            cacheService.set(enrichedData);
            
            return enrichedData;
        } catch (error) {
            if (retries > 0) {
                console.log(`Tentativa falhou, tentando novamente em ${this.retryDelay}ms. Tentativas restantes: ${retries-1}`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchDataWithRetry(retries - 1);
            }
            throw error;
        }
    }

    async getData() {
        try {
            // Verificar cache primeiro
            const cachedData = cacheService.get();
            if (cachedData) {
                return cachedData;
            }

            // Se não houver cache, buscar dados
            return await this.fetchDataWithRetry();
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            
            // Se temos dados em cache, mesmo que expirados, retornar como fallback
            const cachedData = cacheService.get();
            if (cachedData) {
                return cachedData;
            }
            
            throw error;
        }
    }
}

export default new LMEService(); 