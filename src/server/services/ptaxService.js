import fetch from 'node-fetch';

class PTAXService {
    constructor() {
        this.baseUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
    }

    async getPTAXRate(date) {
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const url = `${this.baseUrl}/CotacaoDolarDia(dataCotacao='${formattedDate}')?$format=json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.value && data.value.length > 0 ? data.value[0].cotacaoVenda : null;
        } catch (error) {
            console.error(`Erro ao buscar PTAX para ${date}:`, error);
            return null;
        }
    }

    async enrichDataWithPTAX(data) {
        if (!data.results || !Array.isArray(data.results)) {
            return data;
        }

        const enrichedResults = await Promise.all(
            data.results.map(async (price) => {
                try {
                    const date = new Date(price.data);
                    price.dolar_ptax = await this.getPTAXRate(date);
                } catch (error) {
                    console.error(`Erro ao enriquecer dados com PTAX para ${price.data}:`, error);
                    price.dolar_ptax = null;
                }
                return price;
            })
        );

        return {
            ...data,
            results: enrichedResults
        };
    }
}

export default new PTAXService(); 