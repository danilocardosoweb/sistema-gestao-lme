// Configuração da API
const API_URL = 'http://localhost:3000/api/lme';

// Configuração de cores para os gráficos
const chartColors = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#366ea2',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#a0b4cc'
};

// Armazenar instâncias dos gráficos
let charts = {
    daily: null,
    weekly: null,
    monthly: null
};

// Função para formatar número com 2 casas decimais no padrão brasileiro
function formatNumber(number) {
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para formatar valores de Dólar com 4 casas decimais no padrão brasileiro
function formatDollarNumber(number) {
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
}

// Função para formatar variação percentual no padrão brasileiro
function formatVariation(value) {
    return Math.abs(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para formatar data no padrão brasileiro
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para calcular média de um array de números
function calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, val) => acc + Number(val), 0);
    return sum / validValues.length;
}

// Função para agrupar por semana
function groupByWeek(prices) {
    const grouped = {};
    prices.forEach(price => {
        const date = new Date(price.data);
        date.setHours(12, 0, 0, 0);
        const week = getWeekNumber(date);
        if (!grouped[week]) {
            grouped[week] = [];
        }
        grouped[week].push(price);
    });
    return grouped;
}

// Função para obter número da semana
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Função para agrupar por mês
function groupByMonth(prices) {
    const grouped = {};
    prices.forEach(price => {
        const date = new Date(price.data);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(price);
    });
    return grouped;
}

// Função para criar gráfico
function createChart(ctx, type, data, options, chartKey) {
    // Destruir gráfico existente se houver
    if (charts[chartKey]) {
        charts[chartKey].destroy();
    }

    // Criar novo gráfico
    charts[chartKey] = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            ...options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: chartColors.gridColor
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                },
                y: {
                    grid: {
                        color: chartColors.gridColor
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                }
            }
        }
    });

    return charts[chartKey];
}

// Função para atualizar gráficos
function updateCharts(prices, metal) {
    const sortedPrices = [...prices].sort((a, b) => new Date(a.data) - new Date(b.data));
    
    try {
        // Atualizar títulos dos gráficos
        document.querySelector('.chart-card:nth-child(1) h3').textContent = `Evolução Diária do ${metal.toUpperCase()}`;
        document.querySelector('.charts-row .chart-card:nth-child(1) h3').textContent = `Evolução Semanal do ${metal.toUpperCase()}`;
        document.querySelector('.charts-row .chart-card:nth-child(2) h3').textContent = `Evolução Mensal do ${metal.toUpperCase()}`;

        // Gráfico Diário
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        const dailyData = {
            labels: sortedPrices.map(p => formatDate(p.data)),
            datasets: [{
                label: metal.toUpperCase(),
                data: sortedPrices.map(p => p[metal]),
                backgroundColor: chartColors.backgroundColor,
                borderColor: chartColors.borderColor,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
        createChart(dailyCtx, 'line', dailyData, {}, 'daily');

        // Gráfico Semanal
        const weeklyData = Object.entries(groupByWeek(sortedPrices))
            .sort(([weekA], [weekB]) => weekA - weekB)
            .map(([week, prices]) => ({
                week: `Semana ${week}`,
                average: calculateAverage(prices.map(p => p[metal]))
            }));

        const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
        createChart(weeklyCtx, 'line', {
            labels: weeklyData.map(d => d.week),
            datasets: [{
                data: weeklyData.map(d => d.average),
                backgroundColor: chartColors.backgroundColor,
                borderColor: chartColors.borderColor,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }, {}, 'weekly');

        // Gráfico Mensal
        const monthlyData = Object.entries(groupByMonth(sortedPrices))
            .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
            .map(([month, prices]) => ({
                month: month.split('-')[1] + '/' + month.split('-')[0],
                average: calculateAverage(prices.map(p => p[metal]))
            }));

        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        createChart(monthlyCtx, 'line', {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                data: monthlyData.map(d => d.average),
                backgroundColor: chartColors.backgroundColor,
                borderColor: chartColors.borderColor,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        }, {}, 'monthly');
    } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
    }
}

// Função para atualizar cards de variação
function updateVariationCards(prices, metal) {
    if (prices.length === 0) return;

    // Ordenar preços por data
    const sortedPrices = [...prices].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Variação Diária
    const today = sortedPrices[0];
    const yesterday = sortedPrices[1];
    if (today && yesterday) {
        const dailyVariation = ((today[metal] - yesterday[metal]) / yesterday[metal]) * 100;
        document.querySelector('.card:nth-child(1) h3').textContent = `Variação Diária do ${metal.toUpperCase()}`;
        document.querySelector('.card:nth-child(1) .price-date:nth-child(1)').textContent = `Em ${formatDate(today.data)}`;
        document.querySelector('.card:nth-child(1) .price-value:nth-child(2)').textContent = formatNumber(today[metal]);
        document.querySelector('.card:nth-child(1) .price-date:nth-child(3)').textContent = `Em ${formatDate(yesterday.data)}`;
        document.querySelector('.card:nth-child(1) .price-value:nth-child(4)').textContent = formatNumber(yesterday[metal]);
        const dailyVariationElement = document.querySelector('.card:nth-child(1) .variation');
        dailyVariationElement.textContent = `${dailyVariation >= 0 ? '↑' : '↓'} ${formatVariation(dailyVariation)}%`;
        dailyVariationElement.className = `variation ${dailyVariation >= 0 ? 'positive' : 'negative'}`;
    }

    // Variação Semanal
    const weeklyGroups = groupByWeek(sortedPrices);
    const weeks = Object.keys(weeklyGroups).sort((a, b) => b - a);
    if (weeks.length >= 2) {
        const thisWeekAvg = calculateAverage(weeklyGroups[weeks[0]].map(p => p[metal]));
        const lastWeekAvg = calculateAverage(weeklyGroups[weeks[1]].map(p => p[metal]));
        const weeklyVariation = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;

        document.querySelector('.card:nth-child(2) h3').textContent = `Variação Semanal do ${metal.toUpperCase()}`;
        document.querySelector('.card:nth-child(2) .price-date:nth-child(1)').textContent = `Semana ${weeks[0]}`;
        document.querySelector('.card:nth-child(2) .price-value:nth-child(2)').textContent = formatNumber(thisWeekAvg);
        document.querySelector('.card:nth-child(2) .price-date:nth-child(3)').textContent = `Semana ${weeks[1]}`;
        document.querySelector('.card:nth-child(2) .price-value:nth-child(4)').textContent = formatNumber(lastWeekAvg);
        const weeklyVariationElement = document.querySelector('.card:nth-child(2) .variation');
        weeklyVariationElement.textContent = `${weeklyVariation >= 0 ? '↑' : '↓'} ${formatVariation(weeklyVariation)}%`;
        weeklyVariationElement.className = `variation ${weeklyVariation >= 0 ? 'positive' : 'negative'}`;
    }

    // Variação Mensal
    const monthlyGroups = groupByMonth(sortedPrices);
    const months = Object.keys(monthlyGroups).sort().reverse();
    if (months.length >= 2) {
        const thisMonthAvg = calculateAverage(monthlyGroups[months[0]].map(p => p[metal]));
        const lastMonthAvg = calculateAverage(monthlyGroups[months[1]].map(p => p[metal]));
        const monthlyVariation = ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100;

        document.querySelector('.card:nth-child(3) h3').textContent = `Variação Mensal do ${metal.toUpperCase()}`;
        document.querySelector('.card:nth-child(3) .price-date:nth-child(1)').textContent = `Em ${months[0].split('-')[1]}/${months[0].split('-')[0]}`;
        document.querySelector('.card:nth-child(3) .price-value:nth-child(2)').textContent = formatNumber(thisMonthAvg);
        document.querySelector('.card:nth-child(3) .price-date:nth-child(3)').textContent = `Em ${months[1].split('-')[1]}/${months[1].split('-')[0]}`;
        document.querySelector('.card:nth-child(3) .price-value:nth-child(4)').textContent = formatNumber(lastMonthAvg);
        const monthlyVariationElement = document.querySelector('.card:nth-child(3) .variation');
        monthlyVariationElement.textContent = `${monthlyVariation >= 0 ? '↑' : '↓'} ${formatVariation(monthlyVariation)}%`;
        monthlyVariationElement.className = `variation ${monthlyVariation >= 0 ? 'positive' : 'negative'}`;
    }
}

// Função principal para buscar e atualizar dados
async function fetchAndUpdateDashboard(metal = 'cobre') {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.results) {
            updateVariationCards(data.results, metal);
            updateCharts(data.results, metal);
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Erro ao carregar dados. Por favor, verifique se o servidor está rodando.';
        document.querySelector('.dashboard-container').prepend(errorMessage);
    }
}

// Adicionar event listeners para os botões de metal
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.metal-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const metal = e.target.dataset.metal;
            document.querySelectorAll('.metal-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            fetchAndUpdateDashboard(metal);
        });
    });

    // Inicializar dashboard
    fetchAndUpdateDashboard();

    // Atualizar dados a cada 5 minutos
    setInterval(() => {
        const activeMetal = document.querySelector('.metal-btn.active').dataset.metal;
        fetchAndUpdateDashboard(activeMetal);
    }, 5 * 60 * 1000);
});