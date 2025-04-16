/**
 * Módulo para gerenciamento de solicitações de compra
 * @module request-service
 */

import * as dataManager from './data-manager.js';
import { showToast } from '../ui/notifications.js';
import { formatDate } from '../utils/date-utils.js';
import { emailRequest, sendReviewEmail } from './email-service.js';
import { printRequest } from './print-service.js';

/**
 * Estado atual do serviço
 * @type {Object}
 */
let state = {
    initialized: false,
    currentRequestId: null
};

/**
 * Callbacks para eventos do serviço
 * @type {Object}
 */
let callbacks = {
    onRequestCreated: null,
    onRequestUpdated: null,
    onProductAdded: null,
    onProductRemoved: null,
    onProductUpdated: null
};

/**
 * Inicializa o serviço de solicitações
 * @param {Object} eventCallbacks - Callbacks para eventos
 */
export function initRequestService(eventCallbacks = {}) {
    // Inicializar o gerenciador de dados
    dataManager.initDataManager();
    
    // Registrar callbacks
    callbacks = { ...callbacks, ...eventCallbacks };
    
    state.initialized = true;
    console.log('Serviço de solicitações inicializado');
}

/**
 * Adiciona um produto à solicitação atual
 * @param {Object} product - Produto a ser adicionado
 * @returns {Object} Produto adicionado com ID
 */
export function addProduct(product) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Validar produto
        if (!product.supplier || !product.alloy || !product.productDescription || 
            !product.purchaseType || !product.quantity || !product.deliveryDate) {
            showToast('Todos os campos são obrigatórios', 'error');
            return null;
        }
        
        // Adicionar produto
        const newProduct = dataManager.addProduct(product);
        
        // Notificar callback
        if (callbacks.onProductAdded) {
            callbacks.onProductAdded(newProduct);
        }
        
        return newProduct;
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        showToast('Erro ao adicionar produto', 'error');
        return null;
    }
}

/**
 * Remove um produto da solicitação atual
 * @param {number} productId - ID do produto a ser removido
 * @returns {boolean} Verdadeiro se o produto foi removido
 */
export function removeProduct(productId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return false;
    }
    
    try {
        // Remover produto
        const removed = dataManager.removeProduct(productId);
        
        if (removed) {
            // Notificar callback
            if (callbacks.onProductRemoved) {
                callbacks.onProductRemoved(productId);
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        showToast('Erro ao remover produto', 'error');
        return false;
    }
}

/**
 * Atualiza a data de entrega de um produto
 * @param {number} productId - ID do produto
 * @param {string} newDeliveryDate - Nova data de entrega
 * @returns {Object|null} Produto atualizado ou null se não encontrado
 */
export function updateDeliveryDate(productId, newDeliveryDate) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Validar data
        if (!newDeliveryDate) {
            showToast('Data de entrega inválida', 'error');
            return null;
        }
        
        // Atualizar produto
        const updatedProduct = dataManager.updateProduct(productId, { deliveryDate: newDeliveryDate });
        
        if (updatedProduct) {
            // Notificar callback
            if (callbacks.onProductUpdated) {
                callbacks.onProductUpdated(updatedProduct);
            }
            
            showToast('Data de entrega atualizada com sucesso', 'success');
            return updatedProduct;
        }
        
        showToast('Produto não encontrado', 'error');
        return null;
    } catch (error) {
        console.error('Erro ao atualizar data de entrega:', error);
        showToast('Erro ao atualizar data de entrega', 'error');
        return null;
    }
}

/**
 * Cria uma nova solicitação pendente
 * @returns {Object|null} Solicitação criada ou null se falhar
 */
export function createPendingRequest() {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Obter produtos
        const products = dataManager.getProducts();
        
        if (products.length === 0) {
            showToast('Adicione pelo menos um produto à solicitação', 'error');
            return null;
        }
        
        // Determinar o tipo de compra predominante
        const purchaseType = products.some(p => p.purchaseType === 'Vendas') ? 'Vendas' : 'Transformação';
        
        // Calcular o peso total
        const totalWeight = products.reduce((sum, product) => sum + (typeof product.quantity === 'number' ? product.quantity : 0), 0);
        
        // Criar solicitação
        const request = {
            date: new Date(),
            totalProducts: products.length,
            totalWeight: totalWeight,
            purchaseType: purchaseType,
            status: 'Pendente',
            products: [...products], // Cópia dos produtos
            history: [{
                date: new Date().toISOString(),
                action: 'Criação',
                notes: 'Solicitação criada'
            }]
        };
        
        // Adicionar solicitação
        const newRequest = dataManager.addPendingRequest(request);
        
        // Limpar produtos atuais
        products.forEach(product => {
            dataManager.removeProduct(product.id);
        });
        
        // Limpar localStorage
        dataManager.clearLocalStorage(['PRODUCTS', 'FORM_STATE']);
        
        // Notificar callback
        if (callbacks.onRequestCreated) {
            callbacks.onRequestCreated(newRequest);
        }
        
        showToast('Solicitação finalizada com sucesso!', 'success');
        return newRequest;
    } catch (error) {
        console.error('Erro ao criar solicitação pendente:', error);
        showToast('Erro ao criar solicitação', 'error');
        return null;
    }
}

/**
 * Obtém os detalhes de uma solicitação
 * @param {number} requestId - ID da solicitação
 * @returns {Object|null} Detalhes da solicitação ou null se não encontrada
 */
export function getRequestDetails(requestId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return null;
        }
        
        state.currentRequestId = requestId;
        return request;
    } catch (error) {
        console.error('Erro ao obter detalhes da solicitação:', error);
        showToast('Erro ao obter detalhes da solicitação', 'error');
        return null;
    }
}

/**
 * Aprova uma solicitação
 * @param {number} requestId - ID da solicitação
 * @returns {Object|null} Solicitação atualizada ou null se falhar
 */
export function approveRequest(requestId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return null;
        }
        
        // Atualizar status
        const updatedRequest = dataManager.updatePendingRequest(requestId, {
            status: 'Aprovado',
            history: [
                ...(request.history || []),
                {
                    date: new Date().toISOString(),
                    action: 'Aprovação',
                    notes: 'Solicitação aprovada'
                }
            ]
        });
        
        // Notificar callback
        if (callbacks.onRequestUpdated) {
            callbacks.onRequestUpdated(updatedRequest);
        }
        
        showToast('Solicitação aprovada com sucesso!', 'success');
        return updatedRequest;
    } catch (error) {
        console.error('Erro ao aprovar solicitação:', error);
        showToast('Erro ao aprovar solicitação', 'error');
        return null;
    }
}

/**
 * Rejeita uma solicitação
 * @param {number} requestId - ID da solicitação
 * @returns {Object|null} Solicitação atualizada ou null se falhar
 */
export function rejectRequest(requestId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return null;
        }
        
        // Atualizar status
        const updatedRequest = dataManager.updatePendingRequest(requestId, {
            status: 'Recusado',
            history: [
                ...(request.history || []),
                {
                    date: new Date().toISOString(),
                    action: 'Recusa',
                    notes: 'Solicitação recusada'
                }
            ]
        });
        
        // Notificar callback
        if (callbacks.onRequestUpdated) {
            callbacks.onRequestUpdated(updatedRequest);
        }
        
        showToast('Solicitação recusada.', 'warning');
        return updatedRequest;
    } catch (error) {
        console.error('Erro ao recusar solicitação:', error);
        showToast('Erro ao recusar solicitação', 'error');
        return null;
    }
}

/**
 * Envia uma solicitação para revisão
 * @param {number} requestId - ID da solicitação
 * @param {string} notes - Observações para revisão
 * @returns {Object|null} Solicitação atualizada ou null se falhar
 */
export function sendToReview(requestId, notes) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return null;
    }
    
    try {
        // Validar notas
        if (!notes) {
            showToast('Por favor, adicione observações para a revisão', 'error');
            return null;
        }
        
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return null;
        }
        
        // Atualizar status
        const updatedRequest = dataManager.updatePendingRequest(requestId, {
            status: 'Em Revisão',
            history: [
                ...(request.history || []),
                {
                    date: new Date().toISOString(),
                    action: 'Revisão Solicitada',
                    notes: notes
                }
            ]
        });
        
        // Enviar e-mail para o responsável pela revisão
        sendReviewEmail(updatedRequest, notes);
        
        // Notificar callback
        if (callbacks.onRequestUpdated) {
            callbacks.onRequestUpdated(updatedRequest);
        }
        
        showToast('Solicitação enviada para revisão e e-mail enviado ao responsável.', 'info');
        return updatedRequest;
    } catch (error) {
        console.error('Erro ao enviar solicitação para revisão:', error);
        showToast('Erro ao enviar solicitação para revisão', 'error');
        return null;
    }
}

/**
 * Imprime uma solicitação
 * @param {number} requestId - ID da solicitação
 * @returns {boolean} Verdadeiro se a impressão foi iniciada
 */
export function printRequestById(requestId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return false;
    }
    
    try {
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return false;
        }
        
        // Formatar dados para impressão
        const requestDetails = {
            id: request.id,
            date: typeof request.date === 'string' ? request.date : formatDate(request.date),
            status: request.status,
            items: request.products || []
        };
        
        // Imprimir solicitação
        printRequest(requestDetails);
        
        return true;
    } catch (error) {
        console.error('Erro ao imprimir solicitação:', error);
        showToast('Erro ao imprimir solicitação', 'error');
        return false;
    }
}

/**
 * Envia uma solicitação por e-mail
 * @param {number} requestId - ID da solicitação
 * @returns {boolean} Verdadeiro se o e-mail foi enviado
 */
export function emailRequestById(requestId) {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return false;
    }
    
    try {
        // Obter solicitação
        const request = dataManager.getPendingRequestById(requestId);
        
        if (!request) {
            showToast('Solicitação não encontrada', 'error');
            return false;
        }
        
        // Formatar dados para e-mail
        const requestDetails = {
            id: request.id,
            date: typeof request.date === 'string' ? request.date : formatDate(request.date),
            status: request.status,
            items: request.products || []
        };
        
        // Enviar e-mail
        const sent = emailRequest(requestDetails);
        
        if (sent) {
            showToast('E-mail aberto no seu cliente de e-mail padrão', 'success');
        } else {
            showToast('Erro ao abrir o cliente de e-mail', 'error');
        }
        
        return sent;
    } catch (error) {
        console.error('Erro ao enviar solicitação por e-mail:', error);
        showToast('Erro ao enviar solicitação por e-mail', 'error');
        return false;
    }
}

/**
 * Obtém todas as solicitações pendentes
 * @returns {Array} Lista de solicitações pendentes
 */
export function getAllRequests() {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return [];
    }
    
    try {
        return dataManager.getPendingRequests();
    } catch (error) {
        console.error('Erro ao obter solicitações:', error);
        showToast('Erro ao obter solicitações', 'error');
        return [];
    }
}

/**
 * Obtém todos os produtos da solicitação atual
 * @returns {Array} Lista de produtos
 */
export function getAllProducts() {
    if (!state.initialized) {
        console.error('Serviço de solicitações não inicializado');
        return [];
    }
    
    try {
        return dataManager.getProducts();
    } catch (error) {
        console.error('Erro ao obter produtos:', error);
        showToast('Erro ao obter produtos', 'error');
        return [];
    }
}
