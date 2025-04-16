/**
 * Módulo para funcionalidades de impressão
 * @module print-service
 */

import { formatDate, formatDateTime } from '../utils/date-utils.js';
import { formatNumber } from '../utils/format-utils.js';

/**
 * Configurações padrão para impressão
 * @type {Object}
 */
const defaultConfig = {
    companyName: 'TECNOPERFIL ALUMINIO LTDA',
    systemName: 'Sistema de Gestão LME',
    headerColor: '#1f3b5a',
    accentColor: '#e9f5ff',
    textColor: '#333',
    statusColors: {
        'Pendente': { bg: '#ffc107', color: '#000' },
        'Aprovado': { bg: '#28a745', color: '#fff' },
        'Recusado': { bg: '#dc3545', color: '#fff' },
        'Em Revisão': { bg: '#17a2b8', color: '#fff' }
    }
};

/**
 * Configuração atual
 * @type {Object}
 */
let config = { ...defaultConfig };

/**
 * Inicializa o serviço de impressão com configurações personalizadas
 * @param {Object} customConfig - Configurações personalizadas
 */
export function initPrintService(customConfig = {}) {
    config = { ...defaultConfig, ...customConfig };
}

/**
 * Cria o CSS comum para impressão
 * @returns {string} Estilos CSS
 */
function getCommonStyles() {
    return `
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: ${config.textColor};
        }
        h1, h2, h3 {
            color: ${config.headerColor};
            margin-bottom: 20px;
        }
        .info {
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: ${config.headerColor};
            color: white;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        .status-pendente { background-color: ${config.statusColors['Pendente'].bg}; color: ${config.statusColors['Pendente'].color}; }
        .status-aprovado { background-color: ${config.statusColors['Aprovado'].bg}; color: ${config.statusColors['Aprovado'].color}; }
        .status-recusado { background-color: ${config.statusColors['Recusado'].bg}; color: ${config.statusColors['Recusado'].color}; }
        .status-revisao { background-color: ${config.statusColors['Em Revisão'].bg}; color: ${config.statusColors['Em Revisão'].color}; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
    `;
}

/**
 * Imprime uma solicitação específica
 * @param {Object} requestDetails - Detalhes da solicitação a ser impressa
 */
export function printRequest(requestDetails) {
    const { id, date, status, items } = requestDetails;
    
    if (!id || !date || !status || !items) {
        console.error('Detalhes incompletos para impressão');
        return;
    }
    
    // Calcular o peso total
    let totalWeight = 0;
    items.forEach(item => {
        if (typeof item.quantity === 'number') {
            totalWeight += item.quantity;
        } else {
            // Tentar extrair o valor numérico da quantidade (removendo "kg" e formatação)
            const quantityMatch = item.quantity.match(/([0-9.,]+)/);
            if (quantityMatch) {
                const quantityValue = parseFloat(quantityMatch[1].replace(/\./g, '').replace(',', '.'));
                totalWeight += quantityValue;
            }
        }
    });
    
    // Formatar o total
    const formattedTotal = formatNumber(totalWeight);
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    
    // Criar a tabela de itens
    let itemsTable = `
        <table>
            <thead>
                <tr>
                    <th>Fornecedor</th>
                    <th>Liga</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Quantidade (kg)</th>
                    <th>Previsão Entrega</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Adicionar os itens à tabela
    if (items.length > 0) {
        items.forEach(item => {
            itemsTable += `
                <tr>
                    <td>${item.supplier}</td>
                    <td>${item.alloy}</td>
                    <td>${item.productDescription}</td>
                    <td>${item.purchaseType}</td>
                    <td>${typeof item.quantity === 'number' ? formatNumber(item.quantity) : item.quantity}</td>
                    <td>${typeof item.deliveryDate === 'string' ? item.deliveryDate : formatDate(item.deliveryDate)}</td>
                </tr>
            `;
        });
        
        // Adicionar linha de total
        itemsTable += `
            <tr style="font-weight: bold; background-color: ${config.accentColor};">
                <td colspan="4" style="text-align: right;">Total:</td>
                <td>${formattedTotal} kg</td>
                <td></td>
            </tr>
        `;
    } else {
        itemsTable += `
            <tr>
                <td colspan="6" style="text-align: center;">Nenhum item encontrado na solicitação</td>
            </tr>
        `;
    }
    
    // Fechar a tabela
    itemsTable += `
            </tbody>
        </table>
    `;
    
    // Escrever o conteúdo HTML na nova janela
    printWindow.document.write(`
        <html>
        <head>
            <title>Solicitação de Compra #${id}</title>
            <style>
                ${getCommonStyles()}
            </style>
        </head>
        <body>
            <h1>Solicitação de Compra #${id}</h1>
            <div class="info">
                <p><strong>Data:</strong> ${typeof date === 'string' ? date : formatDate(date)}</p>
                <p><strong>Status:</strong> <span class="status status-${status.toLowerCase().replace(/\s+/g, '')}">${status}</span></p>
            </div>
            
            ${itemsTable}
            
            <div class="footer">
                <p>${config.systemName} - Documento gerado em ${formatDateTime(new Date())}</p>
                <p>${config.companyName}</p>
            </div>
        </body>
        </html>
    `);
    
    // Fechar o documento e focar na janela
    printWindow.document.close();
    printWindow.focus();
    
    // Atraso para garantir que os estilos sejam aplicados
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

/**
 * Imprime uma tabela de solicitações
 * @param {HTMLElement} table - Elemento da tabela a ser impressa
 * @param {string} title - Título da impressão
 */
export function printRequestsTable(table, title = 'Solicitações de Compra') {
    if (!table) {
        console.error('Tabela não encontrada para impressão');
        return;
    }
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    
    // Clonar a tabela para não afetar a original
    const tableClone = table.cloneNode(true);
    
    // Remover a coluna de ações da tabela impressa
    const actionCells = tableClone.querySelectorAll('tr th:last-child, tr td:last-child');
    actionCells.forEach(cell => cell.remove());
    
    // Escrever o conteúdo HTML na nova janela
    printWindow.document.write(`
        <html>
        <head>
            <title>${title} - ${config.companyName}</title>
            <style>
                ${getCommonStyles()}
                
                /* Estilos específicos para a tabela de solicitações */
                table {
                    font-size: 14px;
                }
                th {
                    white-space: nowrap;
                }
                .table-container {
                    overflow-x: auto;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="info">
                <p><strong>Data de Geração:</strong> ${formatDateTime(new Date())}</p>
            </div>
            <div class="table-container">
                ${tableClone.outerHTML}
            </div>
            <div class="footer">
                <p>${config.systemName} - Documento gerado em ${formatDateTime(new Date())}</p>
                <p>${config.companyName}</p>
            </div>
        </body>
        </html>
    `);
    
    // Fechar o documento e focar na janela
    printWindow.document.close();
    printWindow.focus();
    
    // Atraso para garantir que os estilos sejam aplicados
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

/**
 * Imprime um relatório personalizado
 * @param {Object} reportData - Dados do relatório
 * @param {string} reportTitle - Título do relatório
 */
export function printReport(reportData, reportTitle) {
    const { headers, rows, summary } = reportData;
    
    if (!headers || !rows) {
        console.error('Dados incompletos para impressão do relatório');
        return;
    }
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    
    // Criar a tabela do relatório
    let reportTable = `
        <table>
            <thead>
                <tr>
                    ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    // Adicionar as linhas à tabela
    if (rows.length > 0) {
        rows.forEach(row => {
            reportTable += `
                <tr>
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
            `;
        });
    } else {
        reportTable += `
            <tr>
                <td colspan="${headers.length}" style="text-align: center;">Nenhum dado encontrado</td>
            </tr>
        `;
    }
    
    // Fechar a tabela
    reportTable += `
            </tbody>
        </table>
    `;
    
    // Adicionar resumo se existir
    let summaryHtml = '';
    if (summary && Object.keys(summary).length > 0) {
        summaryHtml = `
            <div class="summary">
                <h3>Resumo</h3>
                <ul>
                    ${Object.entries(summary).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Escrever o conteúdo HTML na nova janela
    printWindow.document.write(`
        <html>
        <head>
            <title>${reportTitle} - ${config.companyName}</title>
            <style>
                ${getCommonStyles()}
                
                /* Estilos específicos para relatórios */
                .summary {
                    margin-top: 30px;
                    padding: 15px;
                    background-color: ${config.accentColor};
                    border-radius: 5px;
                }
                .summary ul {
                    list-style-type: none;
                    padding-left: 0;
                }
                .summary li {
                    margin-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <h1>${reportTitle}</h1>
            <div class="info">
                <p><strong>Data de Geração:</strong> ${formatDateTime(new Date())}</p>
            </div>
            <div class="table-container">
                ${reportTable}
            </div>
            ${summaryHtml}
            <div class="footer">
                <p>${config.systemName} - Documento gerado em ${formatDateTime(new Date())}</p>
                <p>${config.companyName}</p>
            </div>
        </body>
        </html>
    `);
    
    // Fechar o documento e focar na janela
    printWindow.document.close();
    printWindow.focus();
    
    // Atraso para garantir que os estilos sejam aplicados
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}
