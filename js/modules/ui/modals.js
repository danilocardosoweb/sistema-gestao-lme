/**
 * Módulo para gerenciamento de modais
 * @module modals
 */

import { formatDate } from '../utils/date-utils.js';
import { showToast } from './notifications.js';

/**
 * Configurações padrão para modais
 * @type {Object}
 */
const defaultConfig = {
    closeOnEscape: true,
    closeOnOutsideClick: true,
    showCloseButton: true,
    animationDuration: 300,
    backdropClass: 'modal-backdrop',
    activeClass: 'active',
    closeButtonClass: 'close-modal'
};

/**
 * Configuração atual
 * @type {Object}
 */
let config = { ...defaultConfig };

/**
 * Modais registrados
 * @type {Object.<string, Object>}
 */
const registeredModals = {};

/**
 * Inicializa o módulo de modais
 * @param {Object} customConfig - Configurações personalizadas
 */
export function initModals(customConfig = {}) {
    config = { ...defaultConfig, ...customConfig };
    
    // Configurar event listener global para tecla ESC
    if (config.closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    console.log('Módulo de modais inicializado');
}

/**
 * Manipulador para tecla ESC
 * @param {KeyboardEvent} e - Evento de teclado
 */
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        // Fechar o último modal aberto
        const openModals = Object.values(registeredModals)
            .filter(modal => modal.isOpen)
            .sort((a, b) => b.zIndex - a.zIndex);
        
        if (openModals.length > 0) {
            const lastOpenedModal = openModals[0];
            closeModal(lastOpenedModal.id);
        }
    }
}

/**
 * Registra um modal
 * @param {string} modalId - ID do modal
 * @param {HTMLElement} modalElement - Elemento do modal
 * @param {Object} modalConfig - Configurações específicas para este modal
 * @param {Object} callbacks - Callbacks para eventos do modal
 * @returns {Object} API do modal
 */
export function registerModal(modalId, modalElement, modalConfig = {}, callbacks = {}) {
    if (!modalElement) {
        console.error(`Elemento do modal ${modalId} não encontrado`);
        return null;
    }
    
    // Configurações específicas para este modal
    const modalSpecificConfig = { ...config, ...modalConfig };
    
    // Criar objeto do modal
    const modal = {
        id: modalId,
        element: modalElement,
        config: modalSpecificConfig,
        callbacks: {
            onOpen: callbacks.onOpen || null,
            onClose: callbacks.onClose || null,
            onConfirm: callbacks.onConfirm || null,
            onCancel: callbacks.onCancel || null
        },
        isOpen: false,
        zIndex: 1000
    };
    
    // Configurar botão de fechar
    if (modalSpecificConfig.showCloseButton) {
        const closeButton = modalElement.querySelector(`.${modalSpecificConfig.closeButtonClass}`);
        if (closeButton) {
            closeButton.addEventListener('click', () => closeModal(modalId));
        }
    }
    
    // Configurar clique fora para fechar
    if (modalSpecificConfig.closeOnOutsideClick) {
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                closeModal(modalId);
            }
        });
    }
    
    // Registrar modal
    registeredModals[modalId] = modal;
    
    // Retornar API do modal
    return {
        open: (data) => openModal(modalId, data),
        close: () => closeModal(modalId),
        isOpen: () => registeredModals[modalId].isOpen,
        update: (newData) => updateModalContent(modalId, newData)
    };
}

/**
 * Abre um modal
 * @param {string} modalId - ID do modal
 * @param {Object} [data] - Dados para o modal
 */
export function openModal(modalId, data = null) {
    const modal = registeredModals[modalId];
    
    if (!modal) {
        console.error(`Modal ${modalId} não registrado`);
        return;
    }
    
    // Atualizar z-index para ficar acima dos outros modais
    const highestZIndex = Object.values(registeredModals)
        .filter(m => m.isOpen)
        .reduce((max, m) => Math.max(max, m.zIndex), 999);
    
    modal.zIndex = highestZIndex + 1;
    modal.element.style.zIndex = modal.zIndex;
    
    // Abrir modal
    modal.element.classList.add(modal.config.activeClass);
    modal.isOpen = true;
    
    // Chamar callback onOpen
    if (modal.callbacks.onOpen) {
        modal.callbacks.onOpen(data);
    }
}

/**
 * Fecha um modal
 * @param {string} modalId - ID do modal
 */
export function closeModal(modalId) {
    const modal = registeredModals[modalId];
    
    if (!modal) {
        console.error(`Modal ${modalId} não registrado`);
        return;
    }
    
    // Fechar modal
    modal.element.classList.remove(modal.config.activeClass);
    modal.isOpen = false;
    
    // Chamar callback onClose
    if (modal.callbacks.onClose) {
        modal.callbacks.onClose();
    }
}

/**
 * Atualiza o conteúdo de um modal
 * @param {string} modalId - ID do modal
 * @param {Object} data - Novos dados para o modal
 */
export function updateModalContent(modalId, data) {
    const modal = registeredModals[modalId];
    
    if (!modal) {
        console.error(`Modal ${modalId} não registrado`);
        return;
    }
    
    // Chamar callback onOpen para atualizar o conteúdo
    if (modal.callbacks.onOpen) {
        modal.callbacks.onOpen(data);
    }
}

/**
 * Registra e configura o modal de edição de data
 * @param {HTMLElement} modalElement - Elemento do modal
 * @param {Function} onConfirm - Callback para confirmação
 * @returns {Object} API do modal
 */
export function setupEditDateModal(modalElement, onConfirm) {
    if (!modalElement) {
        console.error('Modal de edição de data não encontrado');
        return null;
    }
    
    // Elementos do modal
    const newDeliveryDateInput = modalElement.querySelector('#new-delivery-date');
    const cancelEditBtn = modalElement.querySelector('#cancel-edit');
    const confirmEditBtn = modalElement.querySelector('#confirm-edit');
    const editSupplierSpan = modalElement.querySelector('#edit-supplier');
    const editAlloySpan = modalElement.querySelector('#edit-alloy');
    const editProductSpan = modalElement.querySelector('#edit-product');
    
    // Produto atual em edição
    let currentProduct = null;
    
    // Callbacks
    const callbacks = {
        onOpen: (product) => {
            if (!product) {
                console.error('Produto não fornecido para edição de data');
                return;
            }
            
            currentProduct = product;
            
            // Preencher dados do produto
            if (editSupplierSpan) editSupplierSpan.textContent = product.supplier || '';
            if (editAlloySpan) editAlloySpan.textContent = product.alloy || '';
            if (editProductSpan) editProductSpan.textContent = product.productDescription || '';
            
            // Preencher data atual
            if (newDeliveryDateInput) {
                if (typeof product.deliveryDate === 'string') {
                    newDeliveryDateInput.value = product.deliveryDate;
                } else if (product.deliveryDate instanceof Date) {
                    newDeliveryDateInput.value = formatDate(product.deliveryDate);
                }
            }
        },
        onClose: () => {
            // Limpar dados
            currentProduct = null;
            if (newDeliveryDateInput) newDeliveryDateInput.value = '';
        }
    };
    
    // Registrar modal
    const modal = registerModal('editDateModal', modalElement, {}, callbacks);
    
    // Configurar botões
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            modal.close();
        });
    }
    
    if (confirmEditBtn) {
        confirmEditBtn.addEventListener('click', () => {
            if (!currentProduct || !newDeliveryDateInput) {
                console.error('Dados incompletos para atualização de data');
                return;
            }
            
            const newDate = newDeliveryDateInput.value;
            
            // Validar data
            if (!newDate) {
                showToast('Por favor, informe a nova data de entrega', 'error');
                return;
            }
            
            // Chamar callback de confirmação
            if (onConfirm) {
                onConfirm(currentProduct.id, newDate);
            }
            
            // Fechar modal
            modal.close();
        });
    }
    
    return modal;
}

/**
 * Registra e configura o modal de detalhes da solicitação
 * @param {HTMLElement} modalElement - Elemento do modal
 * @param {Object} callbacks - Callbacks para ações
 * @returns {Object} API do modal
 */
export function setupRequestDetailsModal(modalElement, callbacks = {}) {
    if (!modalElement) {
        console.error('Modal de detalhes da solicitação não encontrado');
        return null;
    }
    
    // Elementos do modal
    const requestIdSpan = modalElement.querySelector('#request-id');
    const requestDateSpan = modalElement.querySelector('#request-date');
    const requestStatusSpan = modalElement.querySelector('#request-status');
    const requestItemsTable = modalElement.querySelector('#request-items-table tbody');
    const reviewForm = modalElement.querySelector('.review-form');
    
    // Botões de ação
    const approveBtn = modalElement.querySelector('#approve-request');
    const reviewBtn = modalElement.querySelector('#review-request');
    const rejectBtn = modalElement.querySelector('#reject-request');
    const submitReviewBtn = modalElement.querySelector('#submit-review');
    const cancelReviewBtn = modalElement.querySelector('#cancel-review');
    const printRequestBtn = modalElement.querySelector('#print-request');
    const emailRequestBtn = modalElement.querySelector('#email-request');
    
    // ID da solicitação atual
    let currentRequestId = null;
    
    // Callbacks do modal
    const modalCallbacks = {
        onOpen: (request) => {
            if (!request) {
                console.error('Solicitação não fornecida para detalhes');
                return;
            }
            
            currentRequestId = request.id;
            
            // Preencher dados da solicitação
            if (requestIdSpan) requestIdSpan.textContent = request.id || '';
            if (requestDateSpan) requestDateSpan.textContent = typeof request.date === 'string' ? request.date : formatDate(request.date);
            if (requestStatusSpan) {
                requestStatusSpan.textContent = request.status || '';
                requestStatusSpan.className = 'status-badge ' + getStatusClass(request.status);
            }
            
            // Preencher tabela de itens
            if (requestItemsTable) {
                requestItemsTable.innerHTML = '';
                
                const items = request.products || [];
                let totalWeight = 0;
                
                items.forEach(item => {
                    const row = document.createElement('tr');
                    
                    // Calcular peso total
                    if (typeof item.quantity === 'number') {
                        totalWeight += item.quantity;
                    } else {
                        // Tentar extrair o valor numérico
                        const quantityMatch = item.quantity?.match(/([0-9.,]+)/);
                        if (quantityMatch) {
                            const quantityValue = parseFloat(quantityMatch[1].replace(/\./g, '').replace(',', '.'));
                            totalWeight += quantityValue;
                        }
                    }
                    
                    // Criar células
                    row.innerHTML = `
                        <td>${item.supplier || ''}</td>
                        <td>${item.alloy || ''}</td>
                        <td>${item.productDescription || ''}</td>
                        <td>${item.purchaseType || ''}</td>
                        <td>${item.quantity || ''}</td>
                        <td>${typeof item.deliveryDate === 'string' ? item.deliveryDate : formatDate(item.deliveryDate)}</td>
                    `;
                    
                    requestItemsTable.appendChild(row);
                });
                
                // Adicionar linha de total
                if (items.length > 0) {
                    const totalRow = document.createElement('tr');
                    totalRow.className = 'total-row';
                    totalRow.innerHTML = `
                        <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                        <td><strong>${totalWeight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg</strong></td>
                        <td></td>
                    `;
                    requestItemsTable.appendChild(totalRow);
                }
            }
            
            // Exibir botões de ação apropriados com base no status
            if (approveBtn && reviewBtn && rejectBtn) {
                const status = request.status || '';
                
                // Mostrar/esconder botões com base no status
                if (status === 'Pendente') {
                    approveBtn.style.display = 'block';
                    reviewBtn.style.display = 'block';
                    rejectBtn.style.display = 'block';
                } else {
                    approveBtn.style.display = 'none';
                    reviewBtn.style.display = 'none';
                    rejectBtn.style.display = 'none';
                }
            }
            
            // Esconder formulário de revisão
            if (reviewForm) {
                reviewForm.style.display = 'none';
            }
            
            // Exibir os botões de ação
            const actionsDiv = modalElement.querySelector('.request-actions');
            if (actionsDiv) actionsDiv.style.display = 'flex';
        },
        onClose: () => {
            currentRequestId = null;
            
            // Limpar formulário de revisão
            const reviewNotesTextarea = modalElement.querySelector('#review-notes');
            if (reviewNotesTextarea) {
                reviewNotesTextarea.value = '';
            }
            
            // Esconder formulário de revisão
            if (reviewForm) {
                reviewForm.style.display = 'none';
            }
        }
    };
    
    // Registrar modal
    const modal = registerModal('requestDetailsModal', modalElement, {}, modalCallbacks);
    
    // Configurar botões de ação
    if (approveBtn && callbacks.onApprove) {
        approveBtn.addEventListener('click', () => {
            if (currentRequestId !== null) {
                callbacks.onApprove(currentRequestId);
                modal.close();
            }
        });
    }
    
    if (rejectBtn && callbacks.onReject) {
        rejectBtn.addEventListener('click', () => {
            if (currentRequestId !== null) {
                if (confirm('Tem certeza que deseja recusar esta solicitação?')) {
                    callbacks.onReject(currentRequestId);
                    modal.close();
                }
            }
        });
    }
    
    if (reviewBtn) {
        reviewBtn.addEventListener('click', () => {
            // Mostrar formulário de revisão
            if (reviewForm) {
                reviewForm.style.display = 'block';
            }
            
            // Esconder botões de ação
            const actionsDiv = modalElement.querySelector('.request-actions');
            if (actionsDiv) {
                actionsDiv.style.display = 'none';
            }
        });
    }
    
    if (submitReviewBtn && callbacks.onReview) {
        submitReviewBtn.addEventListener('click', () => {
            if (currentRequestId === null) return;
            
            const reviewNotesTextarea = modalElement.querySelector('#review-notes');
            const notes = reviewNotesTextarea ? reviewNotesTextarea.value.trim() : '';
            
            if (!notes) {
                showToast('Por favor, adicione observações para a revisão.', 'error');
                return;
            }
            
            callbacks.onReview(currentRequestId, notes);
            modal.close();
        });
    }
    
    if (cancelReviewBtn) {
        cancelReviewBtn.addEventListener('click', () => {
            // Esconder formulário de revisão
            if (reviewForm) {
                reviewForm.style.display = 'none';
            }
            
            // Mostrar botões de ação
            const actionsDiv = modalElement.querySelector('.request-actions');
            if (actionsDiv) {
                actionsDiv.style.display = 'flex';
            }
            
            // Limpar textarea
            const reviewNotesTextarea = modalElement.querySelector('#review-notes');
            if (reviewNotesTextarea) {
                reviewNotesTextarea.value = '';
            }
        });
    }
    
    if (printRequestBtn && callbacks.onPrint) {
        printRequestBtn.addEventListener('click', () => {
            if (currentRequestId !== null) {
                callbacks.onPrint(currentRequestId);
            }
        });
    }
    
    if (emailRequestBtn && callbacks.onEmail) {
        emailRequestBtn.addEventListener('click', () => {
            if (currentRequestId !== null) {
                callbacks.onEmail(currentRequestId);
            }
        });
    }
    
    return modal;
}

/**
 * Obtém a classe CSS para um status
 * @param {string} status - Status da solicitação
 * @returns {string} Classe CSS
 */
function getStatusClass(status) {
    const statusMap = {
        'Pendente': 'status-pendente',
        'Aprovado': 'status-aprovado',
        'Recusado': 'status-recusado',
        'Em Revisão': 'status-revisao'
    };
    
    return statusMap[status] || 'status-pendente';
}
