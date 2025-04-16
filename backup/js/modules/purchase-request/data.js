/**
 * Módulo de dados para a funcionalidade de Solicitação de Compras
 * Contém constantes, estado inicial e funções de formatação
 */

// Dados estáticos de produtos por fornecedor
export const productData = {
    'Fornecedor A': {
        'Liga 1': ['Descrição Liga 1'],
        'Liga 2': ['Descrição Liga 2'],
        'Liga 3': ['Descrição Liga 3']
    },
    'Fornecedor B': {
        'Liga X': ['Descrição Liga X'],
        'Liga Y': ['Descrição Liga Y']
    },
    'Fornecedor C': {
        'Liga Alpha': ['Descrição Alpha'],
        'Liga Beta': ['Descrição Beta']
    }
};

// Tipos de compra disponíveis
export const purchaseTypes = [
    'Compra Direta',
    'Licitação',
    'Contrato',
    'Emergencial'
];

// Status possíveis para solicitações
export const requestStatus = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Recusado',
    REVIEW: 'Em Revisão'
};

// Chaves para armazenamento local
export const STORAGE_KEYS = {
    PRODUCTS: 'purchase_request_products',
    PENDING_REQUESTS: 'purchase_request_pending',
    FORM_DATA: 'purchase_request_form'
};

// Estado inicial da aplicação
export const initialState = {
    products: [],
    pendingRequests: [],
    nextId: 1,
    nextPendingId: 1,
    currentRequestId: null
};

/**
 * Formata um número para exibição
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Formata uma data para exibição
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDate(date) {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata mês e ano para exibição
 * @param {Date} date - Data a ser formatada
 * @returns {string} Mês e ano formatados
 */
export function formatMonthYear(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Valida uma data
 * @param {string} dateString - String da data a ser validada
 * @returns {boolean} Se a data é válida
 */
export function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Valida uma quantidade
 * @param {number} quantity - Quantidade a ser validada
 * @returns {boolean} Se a quantidade é válida
 */
export function isValidQuantity(quantity) {
    return !isNaN(quantity) && quantity > 0;
}

/**
 * Gera um ID único
 * @returns {string} ID único
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 