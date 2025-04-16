// Configuração da API
const API_URL = 'http://localhost:3000/api/lme';

// Elementos do DOM
const metalButtons = document.querySelectorAll('.metal-btn');
const dataTableBody = document.getElementById('data-table-body');

// Metal selecionado atualmente
let currentMetal = 'cobre';

// Função para formatar número com 2 casas decimais
function formatNumber(number) {
    if (number === '-' || number === null || isNaN(number)) return '-';
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para formatar valores de Dólar com 4 casas decimais
function formatDollarNumber(number) {
    if (number === '-' || number === null || isNaN(number)) return '-';
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
}

// Função para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para obter o dia da semana
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return days[date.getDay()];
}

// Função para obter a semana do mês
function getWeekOfMonth(date) {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    return Math.ceil((d.getDate() + firstDay.getDay()) / 7);
}

// Função para calcular média de um array de números
function calculateAverage(numbers) {
    const validNumbers = numbers.filter(n => n !== '-' && !isNaN(n) && n !== null);
    if (validNumbers.length === 0) return '-';
    return validNumbers.reduce((a, b) => a + Number(b), 0) / validNumbers.length;
}

// Função para calcular médias do período
function calculatePeriodAverages(data, currentDate) {
    // Calcular média semanal
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weeklyData = data.filter(item => {
        const date = new Date(item.data);
        return date >= weekStart && date <= weekEnd;
    });

    // Calcular média mensal
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyData = data.filter(item => {
        const date = new Date(item.data);
        return date >= monthStart && date <= monthEnd;
    });

    return {
        weekly: {
            dolar: formatDollarNumber(calculateAverage(weeklyData.map(item => item.dolar))),
            lme: formatNumber(calculateAverage(weeklyData.map(item => item[currentMetal]))),
            preco_ton: formatNumber(calculateAverage(weeklyData.map(item => 
                item[currentMetal] !== '-' && item.dolar !== '-' ? 
                Number(item[currentMetal]) * Number(item.dolar) : '-'
            )))
        },
        monthly: {
            dolar: formatDollarNumber(calculateAverage(monthlyData.map(item => item.dolar))),
            lme: formatNumber(calculateAverage(monthlyData.map(item => item[currentMetal]))),
            preco_ton: formatNumber(calculateAverage(monthlyData.map(item => 
                item[currentMetal] !== '-' && item.dolar !== '-' ? 
                Number(item[currentMetal]) * Number(item.dolar) : '-'
            )))
        }
    };
}

// Função para calcular preço por tonelada
function calculatePrecoTon(lmeUsds, dolar) {
    if (lmeUsds === '-' || dolar === '-') return '-';
    return Number(lmeUsds) * Number(dolar);
}

// Função para atualizar a tabela de dados
function updateDataTable(data, metal) {
    if (!dataTableBody) return;

    dataTableBody.innerHTML = '';
    
    // Ordenar dados por data (mais recente primeiro)
    const sortedData = [...data].sort((a, b) => new Date(b.data) - new Date(a.data));

    sortedData.forEach(item => {
        const date = new Date(item.data);
        const averages = calculatePeriodAverages(data, date);
        const precoTon = calculatePrecoTon(item[metal], item.dolar);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(item.data)}</td>
            <td>${getDayOfWeek(item.data)}</td>
            <td>${formatDollarNumber(item.dolar)}</td>
            <td>${formatNumber(item[metal])}</td>
            <td>${formatNumber(precoTon)}</td>
            <td>${averages.weekly.dolar}</td>
            <td>${averages.weekly.lme}</td>
            <td>${averages.weekly.preco_ton}</td>
            <td>${averages.monthly.dolar}</td>
            <td>${averages.monthly.lme}</td>
            <td>${averages.monthly.preco_ton}</td>
        `;
        dataTableBody.appendChild(row);
    });
}

// Função principal para buscar e atualizar dados
async function fetchAndUpdateData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.results) {
            updateDataTable(data.results, currentMetal);
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Erro ao carregar dados. Por favor, verifique se o servidor está rodando.';
        document.querySelector('.analysis-content').prepend(errorMessage);
    }
}

// Event Listeners
metalButtons.forEach(button => {
    button.addEventListener('click', () => {
        metalButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentMetal = button.dataset.metal;
        fetchAndUpdateData();
    });
});

// Inicializar a página
fetchAndUpdateData(); 