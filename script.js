// Configuração da API
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api/lme' 
    : `${window.location.origin}/api/lme`;
const PTAX_API_BASE_URL = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Elementos do DOM
const weekNumberElement = document.getElementById('week-number');
const dateRangeElement = document.getElementById('date-range');
const pricesBodyElement = document.getElementById('prices-body');
const lastUpdateElement = document.getElementById('last-update');

// Cache para armazenar cotações PTAX
let ptaxCache = new Map();

// Função para formatar número com 2 casas decimais
function formatNumber(number) {
    if (number === '-') return '-';
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para normalizar data para meio-dia UTC
function normalizeDate(dateString) {
    const date = new Date(dateString);
    // Definir para meio-dia UTC para evitar problemas com fuso horário
    date.setUTCHours(12, 0, 0, 0);
    return date;
}

// Função para formatar data
function formatDate(dateString) {
    const date = normalizeDate(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para calcular média
function calculateAverage(values) {
    const sum = values.reduce((acc, val) => acc + Number(val), 0);
    return sum / values.length;
}

// Função para obter o número da semana comercial
function getWeekNumber(dateStr) {
    const date = normalizeDate(dateStr);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    startOfYear.setUTCHours(12, 0, 0, 0);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay()) / 7);
    return weekNumber;
}

// Função para verificar se é um dia útil (segunda a sexta)
function isBusinessDay(dateStr) {
    const date = normalizeDate(dateStr);
    const day = date.getDay();
    // Debug do dia
    console.log(`Verificando dia útil: ${date.toISOString()}, dia da semana: ${day}`);
    return day > 0 && day < 6; // 1-5 = segunda-sexta
}

// Função para verificar se uma data está presente nos preços
function findPrice(date, prices) {
    const normalizedDate = normalizeDate(date);
    const dateStr = normalizedDate.toISOString().split('T')[0];
    return prices.find(price => {
        const priceDate = normalizeDate(price.data);
        return priceDate.toISOString().split('T')[0] === dateStr;
    });
}

// Função para gerar datas entre dois períodos
function generateDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
        if (isBusinessDay(current)) {
            dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// Função para agrupar preços por semana
function groupByWeek(prices) {
    const grouped = {};
    
    // Encontrar primeira e última data
    const sortedPrices = [...prices].sort((a, b) => new Date(a.data) - new Date(b.data));
    const firstDate = new Date(sortedPrices[0].data);
    const lastDate = new Date(sortedPrices[sortedPrices.length - 1].data);
    
    // Gerar todas as datas úteis no período
    const allDates = generateDateRange(firstDate, lastDate);
    
    // Debug: Mostrar datas faltantes
    console.log('Verificando datas faltantes:');
    allDates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const hasPrice = findPrice(date, prices);
        if (!hasPrice) {
            console.log(`Data faltante: ${dateStr}`);
        }
    });
    
    // Agrupar por semana, incluindo datas faltantes
    allDates.forEach(date => {
        const weekNumber = getWeekNumber(date);
        if (!grouped[weekNumber]) {
            grouped[weekNumber] = [];
        }
        
        const price = findPrice(date, prices);
        if (price) {
            grouped[weekNumber].push(price);
        } else {
            // Adicionar linha vazia para data faltante
            grouped[weekNumber].push({
                data: date.toISOString().split('T')[0],
                cobre: '-',
                zinco: '-',
                aluminio: '-',
                chumbo: '-',
                estanho: '-',
                niquel: '-',
                dolar: '-',
                isMissing: true
            });
        }
    });
    
    return grouped;
}

// Função para calcular médias semanais
function calculateWeeklyAverages(prices) {
    const metals = ['cobre', 'zinco', 'aluminio', 'chumbo', 'estanho', 'niquel', 'dolar'];
    const averages = {};
    
    metals.forEach(metal => {
        const values = prices.map(p => p[metal]).filter(v => v !== '-');
        if (values.length > 0) {
            const avg = calculateAverage(values);
            averages[metal] = formatNumber(avg);
        } else {
            averages[metal] = '-';
        }
    });
    
    return averages;
}

// Função para formatar data para o formato da API do BCB
function formatDateForBCB(date) {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
}

// Função para buscar cotação PTAX de uma data específica
async function fetchPtaxRate(dateStr) {
    const date = new Date(dateStr);
    const formattedDate = formatDateForBCB(date);
    
    // Verificar cache
    if (ptaxCache.has(dateStr)) {
        return ptaxCache.get(dateStr);
    }

    try {
        const url = `${PTAX_API_BASE_URL}/CotacaoDolarDia(dataCotacao='${formattedDate}')?$format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.value && data.value.length > 0) {
            const rate = data.value[0].cotacaoVenda;
            ptaxCache.set(dateStr, rate);
            return rate;
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar cotação PTAX:', error);
        return null;
    }
}

// Função para buscar cotações PTAX para um período
async function fetchPtaxRatesForPeriod(startDate, endDate) {
    const formattedStartDate = formatDateForBCB(startDate);
    const formattedEndDate = formatDateForBCB(endDate);
    
    try {
        const url = `${PTAX_API_BASE_URL}/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${formattedStartDate}'&@dataFinalCotacao='${formattedEndDate}'&$format=json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.value) {
            data.value.forEach(item => {
                const dateStr = new Date(item.dataHoraCotacao).toISOString().split('T')[0];
                ptaxCache.set(dateStr, item.cotacaoVenda);
            });
        }
    } catch (error) {
        console.error('Erro ao buscar cotações PTAX do período:', error);
    }
}

// Função para formatar data e hora
function formatDateTime(date) {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para calcular variação percentual
function calculateVariation(current, previous) {
    if (!current || !previous) return null;
    return ((current - previous) / previous) * 100;
}

// Função para criar célula de variação
function createVariationCell(variation) {
    if (variation === null) return '-';
    const formattedVariation = formatNumber(Math.abs(variation));
    const className = variation >= 0 ? 'variation-positive' : 'variation-negative';
    return `<td class="${className}">${formattedVariation}</td>`;
}

// Função para calcular análises
function calculateAnalysis(prices, metal) {
    const sortedPrices = [...prices].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Variação Diária
    const today = sortedPrices[0];
    const yesterday = sortedPrices[1];
    const dailyUsdVar = calculateVariation(today?.dolar, yesterday?.dolar);
    const dailyLmeVar = calculateVariation(today?.[metal], yesterday?.[metal]);

    // Variação Semanal
    const thisWeekPrices = sortedPrices.slice(0, 5);
    const lastWeekPrices = sortedPrices.slice(5, 10);
    const thisWeekUsdAvg = calculateAverage(thisWeekPrices.map(p => p.dolar));
    const lastWeekUsdAvg = calculateAverage(lastWeekPrices.map(p => p.dolar));
    const thisWeekLmeAvg = calculateAverage(thisWeekPrices.map(p => p[metal]));
    const lastWeekLmeAvg = calculateAverage(lastWeekPrices.map(p => p[metal]));
    const weeklyUsdVar = calculateVariation(thisWeekUsdAvg, lastWeekUsdAvg);
    const weeklyLmeVar = calculateVariation(thisWeekLmeAvg, lastWeekLmeAvg);

    // Variação Mensal
    const thisMonth = new Date().getMonth();
    const thisMonthPrices = sortedPrices.filter(p => new Date(p.data).getMonth() === thisMonth);
    const lastMonthPrices = sortedPrices.filter(p => new Date(p.data).getMonth() === thisMonth - 1);
    const thisMonthUsdAvg = calculateAverage(thisMonthPrices.map(p => p.dolar));
    const lastMonthUsdAvg = calculateAverage(lastMonthPrices.map(p => p.dolar));
    const thisMonthLmeAvg = calculateAverage(thisMonthPrices.map(p => p[metal]));
    const lastMonthLmeAvg = calculateAverage(lastMonthPrices.map(p => p[metal]));
    const monthlyUsdVar = calculateVariation(thisMonthUsdAvg, lastMonthUsdAvg);
    const monthlyLmeVar = calculateVariation(thisMonthLmeAvg, lastMonthLmeAvg);

    // Variação Anual
    const thisYear = new Date().getFullYear();
    const thisYearPrices = sortedPrices.filter(p => new Date(p.data).getFullYear() === thisYear);
    const firstDayPrice = thisYearPrices[thisYearPrices.length - 1];
    const yearlyUsdVar = calculateVariation(today?.dolar, firstDayPrice?.dolar);
    const yearlyLmeVar = calculateVariation(today?.[metal], firstDayPrice?.[metal]);

    // Variação 12 meses
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const last12MonthsPrices = sortedPrices.filter(p => new Date(p.data) >= oneYearAgo);
    const firstPrice12Months = last12MonthsPrices[last12MonthsPrices.length - 1];
    const last12MonthsUsdVar = calculateVariation(today?.dolar, firstPrice12Months?.dolar);
    const last12MonthsLmeVar = calculateVariation(today?.[metal], firstPrice12Months?.[metal]);

    return {
        daily: [dailyUsdVar, dailyLmeVar],
        weekly: [weeklyUsdVar, weeklyLmeVar],
        monthly: [monthlyUsdVar, monthlyLmeVar],
        yearly: [yearlyUsdVar, yearlyLmeVar],
        last12Months: [last12MonthsUsdVar, last12MonthsLmeVar]
    };
}

// Função para atualizar tabela de análises
function updateAnalysisTable(prices) {
    if (!prices.length) return;

    const metals = ['cobre', 'zinco', 'aluminio', 'chumbo', 'estanho', 'niquel'];
    analysisBodyElement.innerHTML = '';

    metals.forEach(metal => {
        const analysis = calculateAnalysis(prices, metal);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${metal.charAt(0).toUpperCase() + metal.slice(1)}</td>
            ${createVariationCell(analysis.daily[0])}
            ${createVariationCell(analysis.daily[1])}
            ${createVariationCell(analysis.weekly[0])}
            ${createVariationCell(analysis.weekly[1])}
            ${createVariationCell(analysis.monthly[0])}
            ${createVariationCell(analysis.monthly[1])}
            ${createVariationCell(analysis.yearly[0])}
            ${createVariationCell(analysis.yearly[1])}
            ${createVariationCell(analysis.last12Months[0])}
            ${createVariationCell(analysis.last12Months[1])}
        `;
        
        analysisBodyElement.appendChild(row);
    });
}

// Função para atualizar a tabela de preços
async function updatePricesTable(prices) {
    pricesBodyElement.innerHTML = '';

    // Encontrar primeira e última data para buscar PTAX
    const sortedDates = prices.map(p => new Date(p.data)).sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    
    // Buscar todas as cotações PTAX do período
    await fetchPtaxRatesForPeriod(firstDate, lastDate);

    const groupedPrices = groupByWeek(prices);
    const sortedWeeks = Object.keys(groupedPrices).sort((a, b) => b - a);

    for (const week of sortedWeeks) {
        const weekData = groupedPrices[week];
        weekData.sort((a, b) => new Date(b.data) - new Date(a.data));

        for (const price of weekData) {
            const row = document.createElement('tr');
            if (price.isMissing) {
                row.classList.add('missing-data');
            }
            
            const ptaxRate = await fetchPtaxRate(price.data);
            const ptaxDisplay = ptaxRate ? formatNumber(ptaxRate) : '-';
            
            row.innerHTML = `
                <td>${formatDate(price.data)}</td>
                <td>${price.cobre !== '-' ? formatNumber(price.cobre) : '-'}</td>
                <td>${price.zinco !== '-' ? formatNumber(price.zinco) : '-'}</td>
                <td>${price.aluminio !== '-' ? formatNumber(price.aluminio) : '-'}</td>
                <td>${price.chumbo !== '-' ? formatNumber(price.chumbo) : '-'}</td>
                <td>${price.estanho !== '-' ? formatNumber(price.estanho) : '-'}</td>
                <td>${price.niquel !== '-' ? formatNumber(price.niquel) : '-'}</td>
                <td>${price.dolar !== '-' ? formatNumber(price.dolar) : '-'}</td>
                <td>${ptaxDisplay}</td>
            `;
            row.setAttribute('data-week', week);
            pricesBodyElement.appendChild(row);
        }

        // Calcular médias apenas com dados existentes
        const validPrices = weekData.filter(p => !p.isMissing);
        if (validPrices.length > 0) {
            const weekAverages = calculateWeeklyAverages(validPrices);
            const averageRow = document.createElement('tr');
            averageRow.classList.add('week-average-row');
            
            // Calcular média do PTAX para a semana
            const ptaxValues = await Promise.all(validPrices.map(p => fetchPtaxRate(p.data)));
            const validPtaxValues = ptaxValues.filter(v => v !== null);
            const ptaxAverage = validPtaxValues.length > 0 
                ? formatNumber(validPtaxValues.reduce((a, b) => a + b, 0) / validPtaxValues.length)
                : '-';
            
            averageRow.innerHTML = `
                <td>Média Semana ${week}</td>
                <td>${weekAverages.cobre}</td>
                <td>${weekAverages.zinco}</td>
                <td>${weekAverages.aluminio}</td>
                <td>${weekAverages.chumbo}</td>
                <td>${weekAverages.estanho}</td>
                <td>${weekAverages.niquel}</td>
                <td>${weekAverages.dolar}</td>
                <td>${ptaxAverage}</td>
            `;
            averageRow.setAttribute('data-week', week);
            pricesBodyElement.appendChild(averageRow);
        }
    }

    // Adicionar ordenação após preencher a tabela
    setupTableSorting();
}

// Função para atualizar informações de data
function updateDateInfo(prices) {
    if (prices.length === 0) return;

    const sortedPrices = [...prices].sort((a, b) => new Date(b.data) - new Date(a.data));
    const firstDate = new Date(sortedPrices[sortedPrices.length - 1].data);
    const lastDate = new Date(sortedPrices[0].data);
    
    // Atualizar número da semana
    const weekNumber = getWeekNumber(lastDate);
    weekNumberElement.textContent = weekNumber;

    // Atualizar período
    const dateRange = `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
    dateRangeElement.textContent = dateRange;
}

// Função para fazer requisição com retry
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.log(`Tentativa falhou, tentando novamente em ${RETRY_DELAY}ms. Tentativas restantes: ${retries-1}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

// Função para remover mensagens de erro antigas
function clearErrorMessages() {
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
}

// Função para mostrar mensagem de erro
function showErrorMessage(message, container) {
    clearErrorMessages();
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    container.prepend(errorMessage);
}

// Função para mostrar mensagem de aviso sobre dados em cache
function showCacheWarning(container) {
    const warningMessage = document.createElement('div');
    warningMessage.className = 'error-message';
    warningMessage.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
    warningMessage.style.color = '#ffc107';
    warningMessage.textContent = 'Usando dados em cache. Tentando reconectar ao servidor...';
    container.prepend(warningMessage);
}

// Função principal para buscar e atualizar dados
async function fetchAndUpdateData() {
    clearErrorMessages();
    const container = document.querySelector('.data-container');
    
    try {
        const response = await fetchWithRetry(API_URL);
        const data = await response.json();
        
        // Verificar se os dados vieram do cache
        if (response.headers.get('X-Data-Source') === 'cache') {
            showCacheWarning(container);
        }
        
        if (data.results) {
            updatePricesTable(data.results);
            updateDateInfo(data.results);
            
            // Atualizar data/hora da última atualização
            lastUpdateElement.textContent = formatDateTime(new Date());
        } else if (data.error) {
            throw new Error(data.message || 'Erro desconhecido ao buscar dados');
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        showErrorMessage(
            'Erro ao carregar dados. Tentando reconectar ao servidor... ' +
            (error.message || ''),
            container
        );
        
        // Tentar novamente em 30 segundos em caso de erro
        setTimeout(fetchAndUpdateData, 30000);
    }
}

// Verificar status do servidor antes de iniciar
async function checkServerHealth() {
    try {
        const response = await fetchWithRetry(API_URL.replace('/api/lme', '/health'));
        const data = await response.json();
        if (data.status === 'healthy') {
            // Iniciar atualização de dados
            fetchAndUpdateData();
            // Configurar intervalo de atualização
            setInterval(fetchAndUpdateData, 5 * 60 * 1000);
        }
    } catch (error) {
        console.error('Erro ao verificar status do servidor:', error);
        const container = document.querySelector('.data-container');
        showErrorMessage(
            'Não foi possível conectar ao servidor. Tentando novamente em 30 segundos...',
            container
        );
        setTimeout(checkServerHealth, 30000);
    }
}

// Iniciar verificação de saúde do servidor
checkServerHealth();

// Adicionar estilos para indicadores de ordenação
const styleElement = document.createElement('style');
styleElement.textContent = `
    th.sort-asc::after {
        content: ' ▲';
        color: #4a90e2;
    }
    th.sort-desc::after {
        content: ' ▼';
        color: #4a90e2;
    }
    th {
        position: relative;
    }
`;
document.head.appendChild(styleElement);

// Função para ordenar mantendo a estrutura de semanas
function sortTableByColumn(columnIndex, ascending = true) {
    const tbody = document.getElementById('prices-body');
    const rows = Array.from(tbody.rows);
    
    // Agrupar linhas por semana
    const weekGroups = {};
    rows.forEach(row => {
        const week = row.getAttribute('data-week');
        if (!weekGroups[week]) {
            weekGroups[week] = {
                days: [],
                average: null
            };
        }
        if (row.classList.contains('week-average-row')) {
            weekGroups[week].average = row;
        } else {
            weekGroups[week].days.push(row);
        }
    });

    // Ordenar dias dentro de cada semana
    Object.values(weekGroups).forEach(group => {
        group.days.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent;
            const bValue = b.cells[columnIndex].textContent;
            
            if (aValue === '-' && bValue === '-') return 0;
            if (aValue === '-') return ascending ? 1 : -1;
            if (bValue === '-') return ascending ? -1 : 1;
            
            const aNum = parseFloat(aValue.replace(/\./g, '').replace(',', '.'));
            const bNum = parseFloat(bValue.replace(/\./g, '').replace(',', '.'));
            
            return ascending ? aNum - bNum : bNum - aNum;
        });
    });

    // Reconstruir a tabela mantendo a estrutura
    tbody.innerHTML = '';
    Object.entries(weekGroups)
        .sort((a, b) => b[0] - a[0]) // Ordenar semanas em ordem decrescente
        .forEach(([_, group]) => {
            group.days.forEach(row => tbody.appendChild(row));
            if (group.average) {
                tbody.appendChild(group.average);
            }
        });
}

// Configurar ordenação da tabela
function setupTableSorting() {
    const table = document.getElementById('prices-table');
    const headers = table.querySelectorAll('th');
    
    headers.forEach((header, index) => {
        if (index > 0) { // Não adicionar na coluna de data
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                const ascending = !header.classList.contains('sort-asc');
                
                // Remover classes de ordenação de todos os headers
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                // Adicionar classe de ordenação ao header clicado
                header.classList.add(ascending ? 'sort-asc' : 'sort-desc');
                
                // Ordenar a tabela
                sortTableByColumn(index, ascending);
            });
        }
    });
} 