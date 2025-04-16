/**
 * Módulo de exportação para a funcionalidade de Solicitação de Compras
 * Gerencia a impressão e envio por e-mail das solicitações
 */

import { formatNumber, formatDate } from './data.js';
import { showToast } from './ui.js';

/**
 * Imprime uma solicitação de compra
 * @param {Object} requestData - Dados da solicitação
 * @param {string} requestData.id - ID da solicitação
 * @param {string} requestData.date - Data da solicitação
 * @param {string} requestData.status - Status da solicitação
 * @param {Array} requestData.products - Produtos da solicitação
 */
export function printRequest(requestData) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Solicitação de Compra #${requestData.id}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    color: #1f3b5a;
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
                    background-color: #1f3b5a;
                    color: white;
                }
                .status {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .status-pendente { background-color: #ffc107; color: #000; }
                .status-aprovado { background-color: #28a745; color: #fff; }
                .status-recusado { background-color: #dc3545; color: #fff; }
                .status-revisao { background-color: #17a2b8; color: #fff; }
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <h1>Solicitação de Compra #${requestData.id}</h1>
            <div class="info">
                <p><strong>Data:</strong> ${formatDate(requestData.date)}</p>
                <p><strong>Status:</strong> <span class="status status-${requestData.status.toLowerCase()}">${requestData.status}</span></p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Fornecedor</th>
                        <th>Liga</th>
                        <th>Descrição</th>
                        <th>Tipo de Compra</th>
                        <th>Quantidade (kg)</th>
                        <th>Data de Entrega</th>
                    </tr>
                </thead>
                <tbody>
                    ${requestData.products.map(product => `
                        <tr>
                            <td>${product.supplier}</td>
                            <td>${product.alloy}</td>
                            <td>${product.productDescription}</td>
                            <td>${product.purchaseType}</td>
                            <td>${formatNumber(product.quantity)}</td>
                            <td>${formatDate(product.deliveryDate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

/**
 * Envia uma solicitação por e-mail
 * @param {Object} requestData - Dados da solicitação
 * @param {string} requestData.id - ID da solicitação
 * @param {string} requestData.date - Data da solicitação
 * @param {string} requestData.status - Status da solicitação
 */
export function emailRequest(requestData) {
    const subject = `Solicitação de Compra #${requestData.id}`;
    const body = `Detalhes da Solicitação:\n\n` +
                `ID: ${requestData.id}\n` +
                `Data: ${formatDate(requestData.date)}\n` +
                `Status: ${requestData.status}\n\n` +
                `Para mais detalhes, acesse o sistema.`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('E-mail aberto no seu cliente de e-mail padrão', 'success');
} 