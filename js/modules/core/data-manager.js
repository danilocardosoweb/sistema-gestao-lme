/**
 * Módulo para gerenciamento de dados e integração com localStorage
 * @module data-manager
 */

/**
 * Chaves utilizadas para armazenamento no localStorage
 * @type {Object}
 */
const STORAGE_KEYS = {
    PRODUCTS: 'lme_purchase_products',
    PENDING_REQUESTS: 'lme_pending_requests',
    NEXT_ID: 'lme_next_id',
    NEXT_PENDING_ID: 'lme_next_pending_id',
    FORM_STATE: 'lme_form_state'
};

/**
 * Estado atual dos dados
 * @type {Object}
 */
let dataState = {
    products: [],
    pendingRequests: [],
    nextId: 1,
    nextPendingId: 1,
    formState: {}
};

/**
 * Lista de callbacks para notificação de mudanças nos dados
 * @type {Object.<string, Array<Function>>}
 */
const changeListeners = {
    products: [],
    pendingRequests: [],
    formState: []
};

/**
 * Inicializa o gerenciador de dados
 * @returns {Object} Estado inicial dos dados
 */
export function initDataManager() {
    loadFromLocalStorage();
    return { ...dataState };
}

/**
 * Carrega dados do localStorage
 */
export function loadFromLocalStorage() {
    try {
        // Carregar produtos
        const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (storedProducts) {
            dataState.products = JSON.parse(storedProducts);
        }
        
        // Carregar solicitações pendentes
        const storedRequests = localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS);
        if (storedRequests) {
            dataState.pendingRequests = JSON.parse(storedRequests);
        }
        
        // Carregar IDs
        const storedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
        if (storedNextId) {
            dataState.nextId = parseInt(storedNextId, 10);
        }
        
        const storedNextPendingId = localStorage.getItem(STORAGE_KEYS.NEXT_PENDING_ID);
        if (storedNextPendingId) {
            dataState.nextPendingId = parseInt(storedNextPendingId, 10);
        }
        
        // Carregar estado do formulário
        const storedFormState = localStorage.getItem(STORAGE_KEYS.FORM_STATE);
        if (storedFormState) {
            dataState.formState = JSON.parse(storedFormState);
        }
        
        console.log('Dados carregados do localStorage:', { ...dataState });
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
}

/**
 * Salva dados no localStorage
 */
export function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(dataState.products));
        localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(dataState.pendingRequests));
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, dataState.nextId.toString());
        localStorage.setItem(STORAGE_KEYS.NEXT_PENDING_ID, dataState.nextPendingId.toString());
        localStorage.setItem(STORAGE_KEYS.FORM_STATE, JSON.stringify(dataState.formState));
        
        console.log('Dados salvos no localStorage');
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
    }
}

/**
 * Limpa dados do localStorage
 * @param {Array<string>} [keys] - Chaves específicas a serem limpas (todas se não especificado)
 */
export function clearLocalStorage(keys) {
    try {
        if (keys && Array.isArray(keys)) {
            // Limpar apenas chaves específicas
            keys.forEach(key => {
                if (STORAGE_KEYS[key]) {
                    localStorage.removeItem(STORAGE_KEYS[key]);
                }
            });
        } else {
            // Limpar todas as chaves
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Resetar estado
            dataState.products = [];
            dataState.formState = {};
            
            // Notificar listeners
            notifyChangeListeners('products');
            notifyChangeListeners('formState');
        }
        
        console.log('Dados limpos do localStorage');
    } catch (error) {
        console.error('Erro ao limpar dados do localStorage:', error);
    }
}

/**
 * Obtém todos os produtos
 * @returns {Array} Lista de produtos
 */
export function getProducts() {
    return [...dataState.products];
}

/**
 * Adiciona um produto
 * @param {Object} product - Produto a ser adicionado
 * @returns {Object} Produto adicionado com ID
 */
export function addProduct(product) {
    const newProduct = {
        ...product,
        id: dataState.nextId++
    };
    
    dataState.products.push(newProduct);
    saveToLocalStorage();
    notifyChangeListeners('products');
    
    return newProduct;
}

/**
 * Remove um produto pelo ID
 * @param {number} id - ID do produto a ser removido
 * @returns {boolean} Verdadeiro se o produto foi removido
 */
export function removeProduct(id) {
    const initialLength = dataState.products.length;
    dataState.products = dataState.products.filter(product => product.id !== id);
    
    const removed = initialLength > dataState.products.length;
    
    if (removed) {
        saveToLocalStorage();
        notifyChangeListeners('products');
    }
    
    return removed;
}

/**
 * Atualiza um produto existente
 * @param {number} id - ID do produto a ser atualizado
 * @param {Object} updatedProduct - Dados atualizados do produto
 * @returns {Object|null} Produto atualizado ou null se não encontrado
 */
export function updateProduct(id, updatedProduct) {
    const index = dataState.products.findIndex(product => product.id === id);
    
    if (index === -1) {
        return null;
    }
    
    dataState.products[index] = {
        ...dataState.products[index],
        ...updatedProduct,
        id // Garantir que o ID não seja alterado
    };
    
    saveToLocalStorage();
    notifyChangeListeners('products');
    
    return dataState.products[index];
}

/**
 * Obtém todas as solicitações pendentes
 * @returns {Array} Lista de solicitações pendentes
 */
export function getPendingRequests() {
    return [...dataState.pendingRequests];
}

/**
 * Adiciona uma solicitação pendente
 * @param {Object} request - Solicitação a ser adicionada
 * @returns {Object} Solicitação adicionada com ID
 */
export function addPendingRequest(request) {
    const newRequest = {
        ...request,
        id: request.id || dataState.nextPendingId++
    };
    
    dataState.pendingRequests.push(newRequest);
    saveToLocalStorage();
    notifyChangeListeners('pendingRequests');
    
    return newRequest;
}

/**
 * Atualiza uma solicitação pendente
 * @param {number} id - ID da solicitação a ser atualizada
 * @param {Object} updatedRequest - Dados atualizados da solicitação
 * @returns {Object|null} Solicitação atualizada ou null se não encontrada
 */
export function updatePendingRequest(id, updatedRequest) {
    const index = dataState.pendingRequests.findIndex(request => request.id === id);
    
    if (index === -1) {
        return null;
    }
    
    dataState.pendingRequests[index] = {
        ...dataState.pendingRequests[index],
        ...updatedRequest,
        id // Garantir que o ID não seja alterado
    };
    
    saveToLocalStorage();
    notifyChangeListeners('pendingRequests');
    
    return dataState.pendingRequests[index];
}

/**
 * Obtém uma solicitação pendente pelo ID
 * @param {number} id - ID da solicitação
 * @returns {Object|null} Solicitação encontrada ou null
 */
export function getPendingRequestById(id) {
    return dataState.pendingRequests.find(request => request.id === id) || null;
}

/**
 * Salva o estado atual do formulário
 * @param {Object} formState - Estado do formulário
 */
export function saveFormState(formState) {
    dataState.formState = { ...formState };
    saveToLocalStorage();
    notifyChangeListeners('formState');
}

/**
 * Obtém o estado atual do formulário
 * @returns {Object} Estado do formulário
 */
export function getFormState() {
    return { ...dataState.formState };
}

/**
 * Adiciona um listener para mudanças em um tipo de dado
 * @param {string} dataType - Tipo de dado ('products', 'pendingRequests', 'formState')
 * @param {Function} callback - Função a ser chamada quando houver mudanças
 */
export function addChangeListener(dataType, callback) {
    if (!changeListeners[dataType]) {
        changeListeners[dataType] = [];
    }
    
    changeListeners[dataType].push(callback);
}

/**
 * Remove um listener de mudanças
 * @param {string} dataType - Tipo de dado
 * @param {Function} callback - Função a ser removida
 */
export function removeChangeListener(dataType, callback) {
    if (!changeListeners[dataType]) return;
    
    const index = changeListeners[dataType].indexOf(callback);
    if (index !== -1) {
        changeListeners[dataType].splice(index, 1);
    }
}

/**
 * Notifica todos os listeners de um tipo de dado
 * @param {string} dataType - Tipo de dado
 * @private
 */
function notifyChangeListeners(dataType) {
    if (!changeListeners[dataType]) return;
    
    const data = dataType === 'products' ? getProducts() :
                 dataType === 'pendingRequests' ? getPendingRequests() :
                 dataType === 'formState' ? getFormState() : null;
    
    changeListeners[dataType].forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`Erro ao notificar listener de ${dataType}:`, error);
        }
    });
}

/**
 * Configura listeners para campos do formulário para salvar automaticamente
 * @param {Object} formElements - Elementos do formulário
 */
export function attachFormListeners(formElements) {
    const { 
        supplierSelect, 
        alloySelect, 
        productDescriptionSelect, 
        purchaseTypeSelect, 
        quantityInput, 
        deliveryDateInput 
    } = formElements;
    
    const updateFormState = () => {
        const formState = {
            supplier: supplierSelect?.value || '',
            alloy: alloySelect?.value || '',
            productDescription: productDescriptionSelect?.value || '',
            purchaseType: purchaseTypeSelect?.value || '',
            quantity: quantityInput?.value || '',
            deliveryDate: deliveryDateInput?.value || ''
        };
        
        saveFormState(formState);
    };
    
    // Adicionar event listeners para cada campo
    [supplierSelect, alloySelect, productDescriptionSelect, purchaseTypeSelect, quantityInput, deliveryDateInput]
        .filter(element => element) // Filtrar elementos nulos
        .forEach(element => {
            element.addEventListener('change', updateFormState);
            if (element.tagName === 'INPUT') {
                element.addEventListener('input', updateFormState);
            }
        });
}
