/**
 * Módulo para formatação e envio de e-mails
 * @module email-service
 */

import { formatDate, formatDateTime } from '../utils/date-utils.js';
import { formatNumber } from '../utils/format-utils.js';

/**
 * Configurações padrão para e-mails
 * @type {Object}
 */
const defaultConfig = {
    companyName: 'TECNOPERFIL ALUMINIO LTDA',
    systemName: 'Sistema de Gestão LME',
    emailFooter: 'Este e-mail foi enviado automaticamente pelo Sistema de Gestão LME.',
    headerColor: '#1f3b5a',
    accentColor: '#e9f5ff',
    borderColor: '#c5e2ff',
    textColor: '#333',
    statusColors: {
        'Pendente': { bg: '#ffc107', text: '#000' },
        'Aprovado': { bg: '#28a745', text: '#fff' },
        'Recusado': { bg: '#dc3545', text: '#fff' },
        'Em Revisão': { bg: '#17a2b8', text: '#fff' }
    }
};

/**
 * Configuração atual
 * @type {Object}
 */
let config = { ...defaultConfig };

/**
 * Inicializa o serviço de e-mail com configurações personalizadas
 * @param {Object} customConfig - Configurações personalizadas
 */
export function initEmailService(customConfig = {}) {
    config = { ...defaultConfig, ...customConfig };
}

/**
 * Cria um template HTML para e-mail
 * @param {string} title - Título do e-mail
 * @param {string} content - Conteúdo HTML do e-mail
 * @returns {string} Template HTML completo
 */
function createEmailTemplate(title, content) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: ${config.textColor};
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: ${config.headerColor};
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-top: none;
        }
        .info-box {
            background-color: ${config.accentColor};
            border: 1px solid ${config.borderColor};
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: ${config.headerColor};
            color: white;
            text-align: left;
            padding: 10px;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        .notes-box {
            background-color: #fff6e6;
            border: 1px solid #ffe0b2;
            border-radius: 5px;
            padding: 15px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>${title}</h2>
        </div>
        <div class="content">
            ${content}
            
            <div class="footer">
                <p>${config.emailFooter}</p>
                <p>${config.companyName} - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Cria o estilo CSS para um status específico
 * @param {string} status - Status da solicitação
 * @returns {string} Estilo CSS inline
 */
function getStatusStyle(status) {
    const statusKey = status.toLowerCase().replace(/\s+/g, '');
    const colors = {
        'pendente': config.statusColors['Pendente'],
        'aprovado': config.statusColors['Aprovado'],
        'recusado': config.statusColors['Recusado'],
        'emrevisão': config.statusColors['Em Revisão']
    };
    
    const style = colors[statusKey] || colors['pendente'];
    return `background-color: ${style.bg}; color: ${style.text};`;
}

/**
 * Envia um e-mail de revisão para uma solicitação
 * @param {Object} request - Solicitação a ser revisada
 * @param {string} notes - Observações para revisão
 * @returns {boolean} Verdadeiro se o e-mail foi aberto no cliente de e-mail
 */
export function sendReviewEmail(request, notes) {
    // Configurações do e-mail
    const reviewerEmail = "revisor@tecnoperfil.com.br"; // E-mail do responsável pela revisão
    const subject = `Solicitação de Revisão #${request.id} - ${formatDate(request.date)}`;
    
    // Obter os itens da solicitação
    const items = request.items || request.products || [];
    
    // Criar a tabela de itens
    let itemsTable = `
        <table>
            <thead>
                <tr>
                    <th>Fornecedor</th>
                    <th>Liga</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Entrega</th>
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
                    <td>${typeof item.quantity === 'number' ? formatNumber(item.quantity) + ' kg' : item.quantity}</td>
                    <td>${typeof item.deliveryDate === 'string' ? item.deliveryDate : formatDate(item.deliveryDate)}</td>
                </tr>
            `;
        });
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
    
    // Criar o conteúdo do e-mail
    const content = `
        <div class="info-box">
            <div class="info-item"><strong>ID da Solicitação:</strong> #${request.id}</div>
            <div class="info-item"><strong>Data:</strong> ${formatDate(request.date)}</div>
            <div class="info-item"><strong>Status:</strong> <span class="status" style="${getStatusStyle('Em Revisão')}">Em Revisão</span></div>
        </div>
        
        <h3>Itens da Solicitação</h3>
        ${itemsTable}
        
        <div class="notes-box">
            <h3>Observações para Revisão</h3>
            <p>${notes.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>Por favor, revise esta solicitação e faça as alterações necessárias.</p>
    `;
    
    // Criar o corpo do e-mail HTML
    const emailBody = createEmailTemplate('Solicitação de Revisão', content);
    
    // Versão em texto simples para clientes de e-mail que não suportam HTML
    let plainTextBody = `Solicitação de Revisão #${request.id}\n\n`;
    plainTextBody += `Data: ${formatDate(request.date)}\n`;
    plainTextBody += `Status: Em Revisão\n\n`;
    
    plainTextBody += `ITENS DA SOLICITAÇÃO:\n`;
    if (items.length > 0) {
        items.forEach((item, index) => {
            plainTextBody += `\n${index + 1}. ${item.supplier} - ${item.alloy}\n`;
            plainTextBody += `   Descrição: ${item.productDescription}\n`;
            plainTextBody += `   Quantidade: ${typeof item.quantity === 'number' ? formatNumber(item.quantity) + ' kg' : item.quantity}\n`;
            plainTextBody += `   Tipo: ${item.purchaseType}\n`;
            plainTextBody += `   Previsão de Entrega: ${typeof item.deliveryDate === 'string' ? item.deliveryDate : formatDate(item.deliveryDate)}\n`;
        });
    } else {
        plainTextBody += `\nNenhum item encontrado na solicitação.\n`;
    }
    
    plainTextBody += `\nOBSERVAÇÕES PARA REVISÃO:\n${notes}\n\n`;
    plainTextBody += `Por favor, revise esta solicitação e faça as alterações necessárias.\n\n`;
    plainTextBody += `${config.emailFooter}\n`;
    plainTextBody += `${config.companyName} - ${new Date().getFullYear()}`;
    
    try {
        // Usar a API de e-mail do navegador para abrir o cliente de e-mail padrão
        const mailtoLink = `mailto:${reviewerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
        
        // Abrir o cliente de e-mail padrão
        window.open(mailtoLink, '_blank');
        
        console.log('E-mail de revisão gerado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao abrir o cliente de e-mail:', error);
        return false;
    }
}

/**
 * Envia um e-mail com os detalhes de uma solicitação
 * @param {Object} requestDetails - Detalhes da solicitação
 * @returns {boolean} Verdadeiro se o e-mail foi aberto no cliente de e-mail
 */
export function emailRequest(requestDetails) {
    const { id, date, status, items } = requestDetails;
    
    if (!id || !date || !status || !items) {
        console.error('Detalhes incompletos para envio de e-mail');
        return false;
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
    
    // Criar o assunto do e-mail
    const subject = `Solicitação de Compra #${id}`;
    
    // Criar a tabela de itens
    let itemsTable = `
        <table>
            <thead>
                <tr>
                    <th>Fornecedor</th>
                    <th>Liga</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Entrega</th>
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
                    <td>${typeof item.quantity === 'number' ? formatNumber(item.quantity) + ' kg' : item.quantity}</td>
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
    
    // Criar o conteúdo do e-mail
    const content = `
        <div class="info-box">
            <div class="info-item"><strong>ID da Solicitação:</strong> #${id}</div>
            <div class="info-item"><strong>Data:</strong> ${typeof date === 'string' ? date : formatDate(date)}</div>
            <div class="info-item"><strong>Status:</strong> <span class="status" style="${getStatusStyle(status)}">${status}</span></div>
        </div>
        
        <h3>Itens da Solicitação</h3>
        ${itemsTable}
        
        <p>Para mais detalhes, acesse o sistema.</p>
    `;
    
    // Criar o corpo do e-mail HTML
    const emailBody = createEmailTemplate('Solicitação de Compra', content);
    
    // Versão em texto simples para clientes de e-mail que não suportam HTML
    let plainTextBody = `Detalhes da Solicitação:\n\n`;
    plainTextBody += `ID: ${id}\n`;
    plainTextBody += `Data: ${typeof date === 'string' ? date : formatDate(date)}\n`;
    plainTextBody += `Status: ${status}\n\n`;
    
    plainTextBody += `ITENS DA SOLICITAÇÃO:\n`;
    if (items.length > 0) {
        items.forEach((item, index) => {
            plainTextBody += `\n${index + 1}. ${item.supplier} - ${item.alloy}\n`;
            plainTextBody += `   Descrição: ${item.productDescription}\n`;
            plainTextBody += `   Quantidade: ${typeof item.quantity === 'number' ? formatNumber(item.quantity) + ' kg' : item.quantity}\n`;
            plainTextBody += `   Tipo: ${item.purchaseType}\n`;
            plainTextBody += `   Previsão de Entrega: ${typeof item.deliveryDate === 'string' ? item.deliveryDate : formatDate(item.deliveryDate)}\n`;
        });
        plainTextBody += `\nTotal: ${formattedTotal} kg\n`;
    } else {
        plainTextBody += `\nNenhum item encontrado na solicitação.\n`;
    }
    
    plainTextBody += `\nPara mais detalhes, acesse o sistema.`;
    
    try {
        // Usar a API de e-mail do navegador para abrir o cliente de e-mail padrão
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
        
        // Abrir o cliente de e-mail padrão
        window.open(mailtoLink, '_blank');
        
        console.log('E-mail gerado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao abrir o cliente de e-mail:', error);
        return false;
    }
}
