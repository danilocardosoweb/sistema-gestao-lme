/**
 * Módulo de armazenamento para a funcionalidade de Solicitação de Compras
 * Gerencia o armazenamento local e acesso ao banco de dados
 */

import { STORAGE_KEYS } from './data.js';

/**
 * Carrega dados do localStorage
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão se não houver dados
 * @returns {*} - Dados carregados ou valor padrão
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Erro ao carregar ${key} do localStorage:`, error);
        return defaultValue;
    }
}

/**
 * Salva dados no localStorage
 * @param {string} key - Chave do localStorage
 * @param {*} data - Dados a serem salvos
 */
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
}

/**
 * Remove dados do localStorage
 * @param {string} key - Chave do localStorage a ser removida
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Erro ao remover ${key} do localStorage:`, error);
    }
}

/**
 * Carrega todos os dados do localStorage relacionados à solicitação de compras
 * @returns {Object} - Objeto contendo products, pendingRequests e formData
 */
export function loadAllData() {
    return {
        products: loadFromStorage(STORAGE_KEYS.PRODUCTS, []),
        pendingRequests: loadFromStorage(STORAGE_KEYS.PENDING_REQUESTS, []),
        formData: loadFromStorage(STORAGE_KEYS.FORM_DATA, {})
    };
}

/**
 * Salva produtos no localStorage
 * @param {Array} products - Lista de produtos
 */
export function saveProducts(products) {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
}

/**
 * Salva solicitações pendentes no localStorage
 * @param {Array} pendingRequests - Lista de solicitações pendentes
 */
export function savePendingRequests(pendingRequests) {
    saveToStorage(STORAGE_KEYS.PENDING_REQUESTS, pendingRequests);
}

/**
 * Salva dados do formulário no localStorage
 * @param {Object} formData - Dados do formulário
 */
export function saveFormData(formData) {
    saveToStorage(STORAGE_KEYS.FORM_DATA, formData);
}

/**
 * Limpa dados de produtos e formulário do localStorage
 * Mantém as solicitações pendentes
 */
export function clearProductData() {
    removeFromStorage(STORAGE_KEYS.PRODUCTS);
    removeFromStorage(STORAGE_KEYS.FORM_DATA);
} 