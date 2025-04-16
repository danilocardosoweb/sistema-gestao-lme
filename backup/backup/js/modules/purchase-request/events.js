/**
 * Módulo de eventos para a funcionalidade de Solicitação de Compras
 * Gerencia todos os event listeners e handlers da página
 */

import { productData, initialState, formatDate } from './data.js';
import { loadAllData, saveProducts, savePendingRequests, saveFormData, clearProductData } from './storage.js';
import { updateProductsTable, updatePendingRequestsTable, updateAlloyOptions, updateProductDescriptions, showToast } from './ui.js';

/**
 * Inicializa todos os event listeners da página
 * @param {Object} state - Estado global da aplicação
 */
export function initializeEventListeners(state) {
    // Elementos do formulário
    const supplierSelect = document.getElementById('supplier');
    const alloySelect = document.getElementById('alloy');
    const productDescriptionSelect = document.getElementById('productDescription');
    const purchaseTypeSelect = document.getElementById('purchaseType');
    const quantityInput = document.getElementById('quantity');
    const deliveryDateInput = document.getElementById('deliveryDate');
    const addProductBtn = document.getElementById('addProduct');
    const submitRequestBtn = document.getElementById('submitRequest');
    const clearFormBtn = document.getElementById('clearForm');
    
    // Elementos da tabela
    const productsTableBody = document.querySelector('#productsTable tbody');
    const totalProductsEl = document.getElementById('totalProducts');
    const totalWeightEl = document.getElementById('totalWeight');
    const pendingRequestsTable = document.querySelector('#pendingRequestsTable tbody');
    
    // Event Listeners para os selects encadeados
    supplierSelect?.addEventListener('change', () => {
        updateAlloyOptions(productData, supplierSelect, alloySelect, productDescriptionSelect);
        saveFormData({ ...state.formData, supplier: supplierSelect.value });
    });
    
    alloySelect?.addEventListener('change', () => {
        updateProductDescriptions(productData, supplierSelect, alloySelect, productDescriptionSelect);
        saveFormData({ ...state.formData, alloy: alloySelect.value });
    });
    
    productDescriptionSelect?.addEventListener('change', () => {
        saveFormData({ ...state.formData, productDescription: productDescriptionSelect.value });
    });
    
    // Event Listener para o botão de adicionar produto
    addProductBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Validar campos obrigatórios
        if (!supplierSelect.value || !alloySelect.value || !productDescriptionSelect.value || 
            !purchaseTypeSelect.value || !quantityInput.value || !deliveryDateInput.value) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Criar novo produto
        const newProduct = {
            id: state.nextId++,
            supplier: supplierSelect.value,
            alloy: alloySelect.value,
            productDescription: productDescriptionSelect.value,
            purchaseType: purchaseTypeSelect.value,
            quantity: parseFloat(quantityInput.value),
            deliveryDate: deliveryDateInput.value
        };
        
        // Adicionar produto à lista
        state.products.push(newProduct);
        
        // Atualizar tabela e salvar
        updateProductsTable(state.products, productsTableBody, totalProductsEl, totalWeightEl);
        
        // Limpar formulário
        clearForm();
        showToast('Produto adicionado com sucesso!');
    });
    
    // Event Listener para o botão de limpar formulário
    clearFormBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        clearForm();
        showToast('Formulário limpo com sucesso!');
    });
    
    // Event Listener para o botão de enviar solicitação
    submitRequestBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (state.products.length === 0) {
            showToast('Adicione pelo menos um produto à solicitação.', 'error');
            return;
        }
        
        // Criar nova solicitação
        const newRequest = {
            id: state.nextPendingId++,
            date: formatDate(new Date()),
            products: [...state.products],
            status: 'Pendente'
        };
        
        // Adicionar à lista de solicitações pendentes
        state.pendingRequests.push(newRequest);
        
        // Atualizar tabela de solicitações pendentes
        updatePendingRequestsTable(state.pendingRequests, pendingRequestsTable);
        
        // Limpar produtos e formulário
        state.products = [];
        updateProductsTable(state.products, productsTableBody, totalProductsEl, totalWeightEl);
        clearForm();
        clearProductData();
        
        showToast('Solicitação enviada com sucesso!');
    });
    
    // Função auxiliar para limpar o formulário
    function clearForm() {
        supplierSelect.value = '';
        alloySelect.value = '';
        productDescriptionSelect.value = '';
        purchaseTypeSelect.value = '';
        quantityInput.value = '';
        deliveryDateInput.value = '';
        
        alloySelect.disabled = true;
        productDescriptionSelect.disabled = true;
        
        saveFormData({});
    }
}

/**
 * Remove um produto da lista
 * @param {number} productId - ID do produto a ser removido
 * @param {Object} state - Estado global da aplicação
 * @param {HTMLElement} productsTableBody - Elemento tbody da tabela de produtos
 * @param {HTMLElement} totalProductsEl - Elemento para exibir total de produtos
 * @param {HTMLElement} totalWeightEl - Elemento para exibir peso total
 */
export function removeProduct(productId, state, productsTableBody, totalProductsEl, totalWeightEl) {
    state.products = state.products.filter(product => product.id !== productId);
    updateProductsTable(state.products, productsTableBody, totalProductsEl, totalWeightEl);
    showToast('Produto removido com sucesso!');
}

/**
 * Exibe os detalhes de uma solicitação
 * @param {number} requestId - ID da solicitação
 * @param {Object} state - Estado global da aplicação
 */
export function viewRequestDetails(requestId, state) {
    const request = state.pendingRequests.find(req => req.id === requestId);
    if (!request) {
        showToast('Solicitação não encontrada.', 'error');
        return;
    }
    
    // Aqui você pode implementar a lógica para exibir os detalhes
    // Por exemplo, abrir um modal ou navegar para uma página de detalhes
    console.log('Detalhes da solicitação:', request);
} 