export const API_CONFIG = {
    // Configurações da API LME
    LME: {
        baseUrl: 'https://lme.gorilaxpress.com/cotacao/2cf4ff0e-8a30-48a5-8add-f4a1a63fee10/json/',
        maxRetries: 3,
        retryDelay: 1000, // 1 segundo
        cacheExpiration: 5 * 60 * 1000 // 5 minutos
    },

    // Configurações da API PTAX
    PTAX: {
        baseUrl: 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata',
        cacheExpiration: 24 * 60 * 60 * 1000 // 24 horas
    },

    // Configurações gerais
    SERVER: {
        port: process.env.PORT || 3000,
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    }
}; 