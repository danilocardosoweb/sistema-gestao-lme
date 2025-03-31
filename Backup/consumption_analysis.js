// Gerenciamento da Análise de Consumo
let importedData = []; // Declaração movida para o escopo global

document.addEventListener('DOMContentLoaded', function() {
    // Dados de exemplo (em um ambiente real, isso viria de um backend)
    const dadosConsumo = [
        { data: '2024-01-01', produto: 'Cobre', quantidade: 100, unidade: 'kg', valorUnitario: 50, valorTotal: 5000 },
        { data: '2024-01-15', produto: 'Alumínio', quantidade: 200, unidade: 'kg', valorUnitario: 30, valorTotal: 6000 },
        { data: '2024-02-01', produto: 'Cobre', quantidade: 150, unidade: 'kg', valorUnitario: 52, valorTotal: 7800 },
        { data: '2024-02-15', produto: 'Alumínio', quantidade: 180, unidade: 'kg', valorUnitario: 32, valorTotal: 5760 },
        { data: '2024-03-01', produto: 'Cobre', quantidade: 120, unidade: 'kg', valorUnitario: 55, valorTotal: 6600 },
        { data: '2024-03-15', produto: 'Alumínio', quantidade: 220, unidade: 'kg', valorUnitario: 35, valorTotal: 7700 }
    ];

    // Elementos do DOM
    const consumoPeriodoChart = document.getElementById('consumoPeriodoChart');
    const distribuicaoProdutosChart = document.getElementById('distribuicaoProdutosChart');
    const dadosConsumoTable = document.getElementById('dadosConsumoTable');
    const ligaSelect = document.getElementById('liga');
    const clienteSelect = document.getElementById('cliente');
    const dataInicial = document.getElementById('dataInicial');
    const dataFinal = document.getElementById('dataFinal');
    const aplicarFiltros = document.getElementById('aplicarFiltros');
    const filtroMensal = document.getElementById('filtroMensal');
    const filtroTrimestral = document.getElementById('filtroTrimestral');
    const filtroAnual = document.getElementById('filtroAnual');
    const agruparPorSelect = document.getElementById('agruparPor');
    const periodoVisualizacaoSelect = document.getElementById('periodoVisualizacao');

    // Configurar datas padrão (últimos 3 meses)
    const hoje = new Date();
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(hoje.getMonth() - 3);
    
    dataInicial.value = tresMesesAtras.toISOString().split('T')[0];
    dataFinal.value = hoje.toISOString().split('T')[0];

    // Função para calcular variação percentual
    function calcularVariacao(valorAtual, valorAnterior) {
        if (!valorAnterior) return 0;
        return ((valorAtual - valorAnterior) / valorAnterior) * 100;
    }

    // Função para atualizar a tabela de dados
    function updateDataTable() {
        try {
            if (!importedData || !importedData.length) {
                console.log('Sem dados para atualizar a tabela');
                return;
            }

            const tbody = document.getElementById('dadosConsumoTable');
            tbody.innerHTML = '';

            // Criar uma cópia dos dados para ordenação
            const dadosOrdenados = [...importedData].sort((a, b) => b.dataProducao - a.dataProducao);

            dadosOrdenados.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatarData(item.dataProducao)}</td>
                    <td>${item.cliente}</td>
                    <td>${item.liga}</td>
                    <td class="text-right">${formatNumber(item.qtBruta)}</td>
                    <td class="text-right">${formatNumber(item.qtLiquida)}</td>
                    <td class="text-right">${formatNumber(item.eficiencia * 100)}%</td>
                    <td class="text-right">${calcularVariacao(index, dadosOrdenados)}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao atualizar tabela:', error);
            showToast('Erro ao atualizar tabela de dados', 'error');
        }
    }

    // Variáveis globais para os gráficos
    let consumptionChart = null;
    let distributionChart = null;

    // Função para atualizar gráfico de consumo por período
    function atualizarGraficoConsumoPeriodo(dadosFiltrados) {
        const ctx = consumoPeriodoChart.getContext('2d');
        const labels = dadosFiltrados.map(item => new Date(item.data).toLocaleDateString('pt-BR'));
        const valores = dadosFiltrados.map(item => item.valorTotal);

        // Destruir gráfico existente se houver
        if (consumptionChart) {
            consumptionChart.destroy();
            consumptionChart = null;
        }

        consumptionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor Total (R$)',
                    data: valores,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Consumo por Período'
                    }
                }
            }
        });
    }

    // Função para atualizar gráfico de distribuição por produto
    function atualizarGraficoDistribuicaoProdutos(dadosFiltrados) {
        const ctx = distribuicaoProdutosChart.getContext('2d');
        const produtos = [...new Set(dadosFiltrados.map(item => item.produto))];
        const valores = produtos.map(produto => {
            return dadosFiltrados
                .filter(item => item.produto === produto)
                .reduce((acc, item) => acc + item.valorTotal, 0);
        });

        // Destruir gráfico existente se houver
        if (distributionChart) {
            distributionChart.destroy();
            distributionChart = null;
        }

        distributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: produtos,
                datasets: [{
                    data: valores,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Produto'
                    }
                }
            }
        });
    }

    // Função para atualizar gráfico de consumo
    function updateConsumptionChart() {
        try {
            const ctx = document.getElementById('consumoPeriodoChart').getContext('2d');
            
            // Destruir gráfico existente se houver
            if (consumptionChart) {
                consumptionChart.destroy();
                consumptionChart = null;
            }

            // Limpar o canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Agrupar dados por mês
            const dadosPorMes = importedData.reduce((acc, item) => {
                const mes = item.dataProducao.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                if (!acc[mes]) {
                    acc[mes] = {
                        qtLiquida: 0,
                        qtBruta: 0
                    };
                }
                acc[mes].qtLiquida += item.qtLiquida;
                acc[mes].qtBruta += item.qtBruta;
                return acc;
            }, {});

            const labels = Object.keys(dadosPorMes);
            const dataQtLiquida = Object.values(dadosPorMes).map(d => d.qtLiquida);
            const dataQtBruta = Object.values(dadosPorMes).map(d => d.qtBruta);

            consumptionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Quantidade Líquida (kg)',
                            data: dataQtLiquida,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Quantidade Bruta (kg)',
                            data: dataQtBruta,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Consumo por Período',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar gráfico de consumo:', error);
            showToast('Erro ao atualizar gráfico de consumo', 'error');
        }
    }

    // Função para atualizar gráfico de distribuição
    function updateDistributionChart() {
        try {
            const ctx = document.getElementById('distribuicaoProdutosChart').getContext('2d');
            
            // Destruir gráfico existente se houver
            if (distributionChart) {
                distributionChart.destroy();
                distributionChart = null;
            }

            // Limpar o canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Agrupar dados por liga
            const dadosPorLiga = importedData.reduce((acc, item) => {
                if (!acc[item.liga]) {
                    acc[item.liga] = 0;
                }
                acc[item.liga] += item.qtLiquida;
                return acc;
            }, {});

            const labels = Object.keys(dadosPorLiga);
            const data = Object.values(dadosPorLiga);

            distributionChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(153, 102, 255)',
                            'rgb(255, 159, 64)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição por Liga',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar gráfico de distribuição:', error);
            showToast('Erro ao atualizar gráfico de distribuição', 'error');
        }
    }

    // Função para atualizar gráficos e tabelas
    function updateChartsAndTables() {
        try {
            if (!importedData || !importedData.length) return;

            // Atualizar tabela primeiro
            updateDataTable();

            // Pequeno delay para garantir que o DOM foi atualizado
            setTimeout(() => {
                try {
                    // Destruir gráficos existentes
                    if (consumptionChart) {
                        consumptionChart.destroy();
                        consumptionChart = null;
                    }
                    if (distributionChart) {
                        distributionChart.destroy();
                        distributionChart = null;
                    }

                    // Atualizar gráficos
                    updateConsumptionChart();
                    updateDistributionChart();
                } catch (error) {
                    console.error('Erro ao atualizar gráficos:', error);
                    showToast('Erro ao atualizar gráficos', 'error');
                }
            }, 100);
        } catch (error) {
            console.error('Erro ao atualizar visualizações:', error);
            showToast('Erro ao atualizar visualizações', 'error');
        }
    }

    // Função auxiliar para formatar números
    function formatNumber(num) {
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Função para calcular variação
    function calcularVariacao(index, dadosFiltrados) {
        if (!dadosFiltrados || !Array.isArray(dadosFiltrados) || index === dadosFiltrados.length - 1) {
            return '-';
        }
        
        const atual = dadosFiltrados[index].qtLiquida;
        const proximo = dadosFiltrados[index + 1].qtLiquida;
        
        if (!atual || !proximo) {
            return 'NaN%';
        }
        
        const variacao = ((atual - proximo) / proximo) * 100;
        
        if (isNaN(variacao)) {
            return 'NaN%';
        }
        
        const classe = variacao >= 0 ? 'text-success' : 'text-danger';
        return `<span class="${classe}">${variacao.toFixed(2)}%</span>`;
    }

    // Função para mostrar toast
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="bi bi-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Event listeners
    aplicarFiltros.addEventListener('click', aplicarFiltrosDados);

    // Inicializar visualizações
    // Removida chamada inicial de aplicarFiltrosDados() pois não há dados ainda
    showToast('Por favor, importe uma planilha para começar a análise', 'info');

    // Elementos do modal de importação
    const importModal = document.getElementById('import-modal');
    const importExcelBtn = document.getElementById('importExcel');
    const fileInput = document.getElementById('excel-file');
    const selectedFileText = document.querySelector('.selected-file');
    const confirmImportBtn = document.getElementById('confirm-import');
    const cancelImportBtn = document.getElementById('cancel-import');
    const closeModalBtn = importModal.querySelector('.close-modal');

    // Event listeners para o modal de importação
    importExcelBtn.addEventListener('click', () => {
        importModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', closeImportModal);
    cancelImportBtn.addEventListener('click', closeImportModal);

    // Fechar modal ao clicar fora
    importModal.addEventListener('click', (e) => {
        if (e.target === importModal) {
            closeImportModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && importModal.classList.contains('active')) {
            closeImportModal();
        }
    });

    // Função para fechar o modal
    function closeImportModal() {
        importModal.classList.remove('active');
        fileInput.value = '';
        selectedFileText.textContent = '';
        confirmImportBtn.disabled = true;
    }

    // Event listener para seleção de arquivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFileText.textContent = file.name;
            confirmImportBtn.disabled = false;
        } else {
            selectedFileText.textContent = '';
            confirmImportBtn.disabled = true;
        }
    });

    // Função para validar os dados do Excel
    function validateExcelData(data) {
        if (!Array.isArray(data) || data.length === 0) {
            showToast('A planilha está vazia ou em formato inválido.', 'error');
            return false;
        }

        // Normalizar as chaves do objeto (remover espaços extras)
        const normalizedData = data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(key => {
                // Remover todos os espaços extras, incluindo no meio do texto
                const normalizedKey = key.replace(/\s+/g, ' ').trim();
                newRow[normalizedKey] = String(row[key]).trim();
            });
            return newRow;
        });

        // Atualizar a referência dos dados
        data.splice(0, data.length, ...normalizedData);

        const requiredColumns = [
            'Cliente',
            'Liga',
            'Data Produção',
            'Qt. Líquida',
            'Qt. Bruta',
            'Eficiência'
        ];

        const firstRow = data[0];
        
        // Imprimir as colunas encontradas para debug
        console.log('Colunas encontradas após normalização:', Object.keys(firstRow));
        
        // Verificar cada coluna requerida
        const missingColumns = requiredColumns.filter(col => {
            const columnExists = Object.keys(firstRow).some(key => {
                return key === col;
            });
            if (!columnExists) {
                console.log(`Coluna não encontrada: "${col}"`);
            }
            return !columnExists;
        });

        if (missingColumns.length > 0) {
            showToast(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`, 'error');
            return false;
        }

        return true;
    }

    // Função para processar os dados do Excel
    function processExcelData(data) {
        return data.map((row, index) => {
            try {
                // Verificar se as colunas existem e têm valores
                const requiredFields = {
                    'Cliente': row['Cliente'],
                    'Liga': row['Liga'],
                    'Data Produção': row['Data Produção'],
                    'Qt. Líquida': row['Qt. Líquida'],
                    'Qt. Bruta': row['Qt. Bruta'],
                    'Eficiência': row['Eficiência']
                };

                Object.entries(requiredFields).forEach(([field, value]) => {
                    if (!value && value !== 0) {
                        throw new Error(`Campo "${field}" está vazio na linha ${index + 2}`);
                    }
                });

                // Converter data
                let dataProducao;
                try {
                    const dataStr = row['Data Produção'].trim();
                    const parts = dataStr.split('/');
                    if (parts.length === 3) {
                        let ano = parts[2];
                        if (ano.length === 2) {
                            ano = '20' + ano;
                        }
                        dataProducao = new Date(ano, parts[1] - 1, parts[0]);
                    } else {
                        throw new Error('Formato de data inválido');
                    }

                    if (isNaN(dataProducao.getTime())) {
                        throw new Error('Data inválida');
                    }
                } catch (e) {
                    console.error('Erro ao processar data:', row['Data Produção']);
                    throw new Error(`Data de produção inválida na linha ${index + 2}. Use o formato DD/MM/AAAA`);
                }

                // Converter números
                const qtLiquida = parseFloat(row['Qt. Líquida'].replace(/\s+/g, '').replace(',', '.'));
                if (isNaN(qtLiquida)) {
                    throw new Error(`Quantidade líquida inválida na linha ${index + 2}`);
                }

                const qtBruta = parseFloat(row['Qt. Bruta'].replace(/\s+/g, '').replace(',', '.'));
                if (isNaN(qtBruta)) {
                    throw new Error(`Quantidade bruta inválida na linha ${index + 2}`);
                }

                let eficiencia = row['Eficiência'].replace(/\s+/g, '').replace(',', '.').replace('%', '');
                eficiencia = parseFloat(eficiencia) / 100;
                if (isNaN(eficiencia)) {
                    throw new Error(`Eficiência inválida na linha ${index + 2}`);
                }

                return {
                    cliente: row['Cliente'].trim(),
                    liga: row['Liga'].trim(),
                    dataProducao,
                    qtLiquida,
                    qtBruta,
                    eficiencia
                };
            } catch (error) {
                console.error(`Erro ao processar linha ${index + 2}:`, error);
                showToast(error.message, 'error');
                throw error;
            }
        });
    }

    // Event listener para importação
    confirmImportBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            showToast('Selecione um arquivo para importar.', 'error');
            return;
        }

        // Verificar extensão do arquivo
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['xls', 'xlsx'].includes(fileExt)) {
            showToast('O arquivo deve ser uma planilha Excel (.xls ou .xlsx)', 'error');
            return;
        }

        // Mostrar progresso
        const progressBar = document.querySelector('.upload-progress');
        progressBar.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                if (workbook.SheetNames.length === 0) {
                    throw new Error('A planilha não contém nenhuma aba.');
                }

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                    raw: false,
                    defval: '',
                    blankrows: false
                });

                console.log('Dados convertidos:', jsonData[0]); // Debug dos dados

                if (validateExcelData(jsonData)) {
                    importedData = processExcelData(jsonData);
                    updateChartsAndTables();
                    showToast('Dados importados com sucesso!', 'success');
                    closeImportModal();
                }
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                showToast(error.message || 'Erro ao processar o arquivo. Verifique o formato.', 'error');
            } finally {
                progressBar.style.display = 'none';
            }
        };

        reader.onerror = function() {
            showToast('Erro ao ler o arquivo. Tente novamente.', 'error');
            progressBar.style.display = 'none';
        };

        reader.readAsArrayBuffer(file);
    });

    // Função para atualizar os selects de filtro
    function atualizarFiltros() {
        // Limpar selects
        ligaSelect.innerHTML = '<option value="">Todas</option>';
        clienteSelect.innerHTML = '<option value="">Todos</option>';

        // Lista fixa de ligas
        const ligas = ['6005', '6060', '6061', '6063', '6082', '6101', '6351', '6460', '6463'];

        // Preencher select de ligas
        ligas.forEach(liga => {
            const option = document.createElement('option');
            option.value = liga;
            option.textContent = liga;
            ligaSelect.appendChild(option);
        });

        // Se houver dados importados, preencher o select de clientes
        if (importedData && importedData.length > 0) {
            // Obter clientes únicos dos dados importados
            const clientes = [...new Set(importedData.map(item => item.cliente))];

            // Preencher select de clientes
            clientes.sort().forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente;
                option.textContent = cliente;
                clienteSelect.appendChild(option);
            });
        }
    }

    // Função para aplicar filtros
    function aplicarFiltrosDados() {
        if (!importedData || !importedData.length) return;

        let dadosFiltrados = [...importedData];

        // Filtrar por data
        if (dataInicial.value) {
            const dataIni = new Date(dataInicial.value);
            dadosFiltrados = dadosFiltrados.filter(item => item.dataProducao >= dataIni);
        }
        if (dataFinal.value) {
            const dataFim = new Date(dataFinal.value);
            dataFim.setHours(23, 59, 59, 999); // Incluir todo o último dia
            dadosFiltrados = dadosFiltrados.filter(item => item.dataProducao <= dataFim);
        }

        // Filtrar por liga
        if (ligaSelect.value) {
            dadosFiltrados = dadosFiltrados.filter(item => item.liga === ligaSelect.value);
        }

        // Filtrar por cliente
        if (clienteSelect.value) {
            dadosFiltrados = dadosFiltrados.filter(item => item.cliente === clienteSelect.value);
        }

        // Ordenar por data
        dadosFiltrados.sort((a, b) => a.dataProducao - b.dataProducao);

        // Atualizar visualizações com os dados filtrados
        atualizarVisualizacoes(dadosFiltrados);
    }

    // Função para atualizar visualizações com dados filtrados
    function atualizarVisualizacoes(dadosFiltrados) {
        // Atualizar tabela com agrupamento
        atualizarTabelaAgrupada(dadosFiltrados);

        // Atualizar gráficos
        atualizarGraficos(dadosFiltrados);
    }

    // Função para atualizar gráficos com dados filtrados
    function atualizarGraficos(dadosFiltrados) {
        try {
            // Destruir gráficos existentes
            if (consumptionChart) {
                consumptionChart.destroy();
                consumptionChart = null;
            }
            if (distributionChart) {
                distributionChart.destroy();
                distributionChart = null;
            }

            // Atualizar gráfico de consumo
            const ctxConsumo = consumoPeriodoChart.getContext('2d');
            ctxConsumo.clearRect(0, 0, consumoPeriodoChart.width, consumoPeriodoChart.height);

            // Agrupar dados por mês
            const dadosPorMes = dadosFiltrados.reduce((acc, item) => {
                const mes = item.dataProducao.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                if (!acc[mes]) {
                    acc[mes] = {
                        qtLiquida: 0,
                        qtBruta: 0
                    };
                }
                acc[mes].qtLiquida += item.qtLiquida;
                acc[mes].qtBruta += item.qtBruta;
                return acc;
            }, {});

            const labels = Object.keys(dadosPorMes);
            const dataQtLiquida = Object.values(dadosPorMes).map(d => d.qtLiquida);
            const dataQtBruta = Object.values(dadosPorMes).map(d => d.qtBruta);

            consumptionChart = new Chart(ctxConsumo, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Quantidade Líquida (kg)',
                            data: dataQtLiquida,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        },
                        {
                            label: 'Quantidade Bruta (kg)',
                            data: dataQtBruta,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Consumo por Período',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });

            // Atualizar gráfico de distribuição
            const ctxDistribuicao = distribuicaoProdutosChart.getContext('2d');
            ctxDistribuicao.clearRect(0, 0, distribuicaoProdutosChart.width, distribuicaoProdutosChart.height);

            // Agrupar dados por liga
            const dadosPorLiga = dadosFiltrados.reduce((acc, item) => {
                if (!acc[item.liga]) {
                    acc[item.liga] = 0;
                }
                acc[item.liga] += item.qtLiquida;
                return acc;
            }, {});

            distributionChart = new Chart(ctxDistribuicao, {
                type: 'pie',
                data: {
                    labels: Object.keys(dadosPorLiga),
                    datasets: [{
                        data: Object.values(dadosPorLiga),
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(153, 102, 255)',
                            'rgb(255, 159, 64)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição por Liga',
                            color: '#ffffff'
                        },
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar gráficos:', error);
            showToast('Erro ao atualizar gráficos', 'error');
        }
    }

    // Event listeners para os filtros de período
    filtroMensal.addEventListener('click', () => {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicial.value = inicioMes.toISOString().split('T')[0];
        dataFinal.value = hoje.toISOString().split('T')[0];
        aplicarFiltrosDados();
    });

    filtroTrimestral.addEventListener('click', () => {
        const hoje = new Date();
        const inicioTrimestre = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
        dataInicial.value = inicioTrimestre.toISOString().split('T')[0];
        dataFinal.value = hoje.toISOString().split('T')[0];
        aplicarFiltrosDados();
    });

    filtroAnual.addEventListener('click', () => {
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        dataInicial.value = inicioAno.toISOString().split('T')[0];
        dataFinal.value = hoje.toISOString().split('T')[0];
        aplicarFiltrosDados();
    });

    // Event listeners para os filtros
    aplicarFiltros.addEventListener('click', aplicarFiltrosDados);
    ligaSelect.addEventListener('change', aplicarFiltrosDados);
    clienteSelect.addEventListener('change', aplicarFiltrosDados);

    // Atualizar filtros quando dados forem importados
    document.addEventListener('DOMContentLoaded', () => {
        if (importedData && importedData.length) {
            atualizarFiltros();
            aplicarFiltrosDados();
        }
    });

    // Função para atualizar a tabela com dados agrupados
    function atualizarTabelaAgrupada(dadosFiltrados) {
        const tbody = document.getElementById('dadosConsumoTable');
        tbody.innerHTML = '';
        
        // Ordenar dados por data decrescente
        dadosFiltrados.sort((a, b) => b.dataProducao - a.dataProducao);
        
        dadosFiltrados.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatarData(item.dataProducao)}</td>
                <td>${item.cliente}</td>
                <td>${item.liga}</td>
                <td class="text-right">${formatNumber(item.qtBruta)}</td>
                <td class="text-right">${formatNumber(item.qtLiquida)}</td>
                <td class="text-right">${formatNumber(item.eficiencia * 100)}%</td>
                <td class="text-right">${calcularVariacao(index, dadosFiltrados)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Função auxiliar para formatar datas
    function formatarData(data) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    // Event listeners para os controles de agrupamento
    agruparPorSelect.addEventListener('change', () => {
        aplicarFiltrosDados();
    });

    periodoVisualizacaoSelect.addEventListener('change', () => {
        if (agruparPorSelect.value === 'periodo') {
            aplicarFiltrosDados();
        }
    });
}); 