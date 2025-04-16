/**
 * Utilitários para formatação de números, textos e elementos visuais
 * @module format-utils
 */

/**
 * Formata um número para o padrão brasileiro (com separador de milhar e decimal)
 * @param {number} number - Número a ser formatado
 * @param {number} [minimumFractionDigits=2] - Mínimo de casas decimais
 * @param {number} [maximumFractionDigits=2] - Máximo de casas decimais
 * @returns {string} Número formatado no padrão brasileiro
 */
export function formatNumber(number, minimumFractionDigits = 2, maximumFractionDigits = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits,
        maximumFractionDigits
    }).format(number);
}

/**
 * Formata um valor monetário para o padrão brasileiro
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda brasileira (R$)
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Obtém a cor do badge baseado no status
 * @param {string} status - Status da solicitação
 * @returns {string} Classe CSS correspondente ao status
 */
export function getStatusColor(status) {
    const statusMap = {
        'Pendente': 'status-pendente',
        'Aprovado': 'status-aprovado',
        'Recusado': 'status-recusado',
        'Em Revisão': 'status-revisao'
    };
    
    return statusMap[status] || 'status-pendente';
}

/**
 * Obtém a cor do badge baseado na prioridade
 * @param {string} priority - Prioridade da solicitação
 * @returns {string} Classe CSS correspondente à prioridade
 */
export function getPriorityColor(priority) {
    const priorityMap = {
        'Alta': 'priority-high',
        'Média': 'priority-medium',
        'Baixa': 'priority-low'
    };
    
    return priorityMap[priority] || 'priority-medium';
}

/**
 * Trunca um texto para um tamanho máximo e adiciona reticências se necessário
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo do texto
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Converte um texto para um formato seguro para uso em IDs HTML
 * @param {string} text - Texto a ser convertido
 * @returns {string} Texto seguro para uso como ID
 */
export function textToId(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]/g, '-') // Substitui caracteres não alfanuméricos por hífen
        .replace(/-+/g, '-') // Remove hífens duplicados
        .replace(/^-|-$/g, ''); // Remove hífens no início e fim
}

/**
 * Formata um número como peso (kg)
 * @param {number} weight - Peso em kg
 * @returns {string} Peso formatado com unidade
 */
export function formatWeight(weight) {
    return `${formatNumber(weight)} kg`;
}

/**
 * Formata um texto para exibição em tabelas, tratando valores vazios
 * @param {string} text - Texto a ser formatado
 * @param {string} [emptyText='-'] - Texto a ser exibido quando vazio
 * @returns {string} Texto formatado
 */
export function formatTableCell(text, emptyText = '-') {
    return text || emptyText;
}
