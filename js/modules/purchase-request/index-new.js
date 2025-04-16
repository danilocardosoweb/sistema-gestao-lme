/**
 * Módulo principal da funcionalidade de Solicitação de Compras
 * Integra todos os módulos refatorados e inicializa a aplicação
 * @module purchase-request/index
 */

// Importar módulos utilitários
import * as dateUtils from '../utils/date-utils.js';
import * as formatUtils from '../utils/format-utils.js';
import * as validation from '../utils/validation.js';

// Importar módulos de UI
import * as notifications from '../ui/notifications.js';
import * as calendar from '../ui/calendar.js';
import * as modals from '../ui/modals.js';
import * as forms from '../ui/forms.js';
import * as tables from '../ui/tables.js';

// Importar módulos core
import * as dataManager from '../core/data-manager.js';
import * as requestService from '../core/request-service.js';
import * as emailService from '../core/email-service.js';
import * as printService from '../core/print-service.js';

/**
 * Inicializa a aplicação
 */
function initApp() {
    console.log('Inicializando aplicação de Solicitação de Compras...');
    
    // Inicializar módulos
    initializeModules();
    
    // Configurar elementos da UI
    setupUI();
    
    // Carregar dados iniciais
    loadInitialData();
    
    console.log('Aplicação inicializada com sucesso!');
}

/**
 * Inicializa todos os módulos
 */
function initializeModules() {
    // Inicializar notificações
    notifications.initNotifications({
        position: 'bottom-right',
        duration: 3000
    });
    
    // Inicializar serviço de e-mail
    emailService.initEmailService({
        companyName: 'TECNOPERFIL ALUMINIO LTDA',
        systemName: 'Sistema de Gestão LME'
    });
    
    // Inicializar serviço de impressão
    printService.initPrintService({
        companyName: 'TECNOPERFIL ALUMINIO LTDA',
        systemName: 'Sistema de Gestão LME'
    });
    
    // Inicializar tabelas
    tables.initTables();
    
    // Inicializar gerenciador de dados
    dataManager.initDataManager();
    
    // Inicializar modais
    modals.initModals();
    
    // Inicializar serviço de solicitações
    requestService.initRequestService({
        onRequestCreated: handleRequestCreated,
        onRequestUpdated: handleRequestUpdated,
        onProductAdded: handleProductAdded,
        onProductRemoved: handleProductRemoved,
        onProductUpdated: handleProductUpdated
    });
}

/**
 * Configura elementos da UI
 */
function setupUI() {
    // Configurar formulário de compra
    setupPurchaseForm();
    
    // Configurar calendário
    setupCalendar();
    
    // Configurar modais
    setupModals();
    
    // Configurar tabelas
    setupTables();
    
    // Configurar botões e ações
    setupActions();
}

/**
 * Configura o formulário de compra
 */
function setupPurchaseForm() {
    const formElements = {
        form: document.getElementById('purchase-form'),
        supplierSelect: document.getElementById('supplier'),
        alloySelect: document.getElementById('alloy'),
        productDescriptionSelect: document.getElementById('product_description'),
        purchaseTypeSelect: document.getElementById('purchase_type'),
        quantityInput: document.getElementById('quantidade'),
        deliveryDateInput: document.getElementById('delivery_date')
    };
    
    // Verificar se os elementos essenciais existem
    if (!formElements.form || !formElements.supplierSelect) {
        console.error('Elementos essenciais do formulário não encontrados');
        return;
    }
    
    // Inicializar formulário
    forms.initForms(formElements, {
        onSubmit: handleFormSubmit,
        onChange: handleFormChange
    });
    
    // Carregar estado do formulário salvo
    const formState = dataManager.getFormState();
    if (formState && Object.keys(formState).length > 0) {
        forms.setFormData(formState);
    }
    
    console.log('Formulário de compra configurado');
}

/**
 * Configura o calendário
 */
function setupCalendar() {
    const calendarElements = {
        calendarModal: document.getElementById('calendar-modal'),
        calendarGrid: document.getElementById('calendar-grid'),
        currentMonthDisplay: document.getElementById('current-month-display'),
        prevMonthBtn: document.getElementById('prev-month'),
        nextMonthBtn: document.getElementById('next-month'),
        dayDetailsContainer: document.getElementById('day-details'),
        closeModalBtn: document.querySelector('#calendar-modal .close-modal')
    };
    
    // Verificar se os elementos essenciais existem
    if (!calendarElements.calendarModal || !calendarElements.calendarGrid) {
        console.error('Elementos essenciais do calendário não encontrados');
        return;
    }
    
    // Obter produtos para o calendário
    const products = requestService.getAllProducts();
    
    // Inicializar calendário
    calendar.initCalendar(calendarElements, {}, {
        onDayClick: handleDayClick,
        onMonthChange: handleMonthChange,
        onEditProduct: handleEditProduct
    }, products);
    
    // Configurar botão para abrir o calendário
    const viewCalendarBtn = document.getElementById('view-calendar');
    if (viewCalendarBtn) {
        viewCalendarBtn.addEventListener('click', () => {
            calendar.showCalendar();
        });
    }
    
    console.log('Calendário configurado');
}

/**
 * Configura os modais
 */
function setupModals() {
    // Modal de edição de data
    const editDateModal = document.getElementById('edit-date-modal');
    if (editDateModal) {
        modals.setupEditDateModal(editDateModal, handleDeliveryDateUpdate);
    }
    
    // Modal de detalhes da solicitação
    const requestDetailsModal = document.getElementById('request-details-modal');
    if (requestDetailsModal) {
        modals.setupRequestDetailsModal(requestDetailsModal, {
            onApprove: handleApproveRequest,
            onReject: handleRejectRequest,
            onReview: handleReviewRequest,
            onPrint: handlePrintRequest,
            onEmail: handleEmailRequest
        });
    }
    
    // Configurar contador de caracteres para o textarea de observações
    const reviewNotesTextarea = document.getElementById('review-notes');
    const charCountElement = document.getElementById('char-count');
    if (reviewNotesTextarea && charCountElement) {
        forms.setupTextareaCharCounter(reviewNotesTextarea, charCountElement, 500);
    }
    
    console.log('Modais configurados');
}

/**
 * Configura as tabelas
 */
function setupTables() {
    // Tabela de produtos
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        // Atualizar tabela com produtos atuais
        const products = requestService.getAllProducts();
        tables.updateProductsTable(productsTable, products, {
            onRemove: handleRemoveProduct
        });
    }
    
    // Tabela de solicitações pendentes
    const pendingRequestsTable = document.getElementById('pending-requests-table');
    if (pendingRequestsTable) {
        // Atualizar tabela com solicitações pendentes
        const requests = requestService.getAllRequests();
        tables.updatePendingRequestsTable(pendingRequestsTable, requests, {
            onViewDetails: handleViewRequestDetails
        });
    }
    
    console.log('Tabelas configuradas');
}

/**
 * Configura botões e ações
 */
function setupActions() {
    // Botão para imprimir tabela de solicitações
    const printTableBtn = document.getElementById('print-table');
    if (printTableBtn) {
        printTableBtn.addEventListener('click', () => {
            const table = document.getElementById('pending-requests-table');
            if (table) {
                printService.printRequestsTable(table, 'Solicitações de Compra');
                notifications.showToast('Preparando impressão da tabela...', 'info');
            }
        });
    }
    
    // Botão para atualizar tabela de solicitações
    const refreshTableBtn = document.getElementById('refresh-table');
    if (refreshTableBtn) {
        refreshTableBtn.addEventListener('click', () => {
            const pendingRequestsTable = document.getElementById('pending-requests-table');
            if (pendingRequestsTable) {
                const requests = requestService.getAllRequests();
                tables.updatePendingRequestsTable(pendingRequestsTable, requests, {
                    onViewDetails: handleViewRequestDetails
                });
                notifications.showToast('Tabela de solicitações atualizada!', 'success');
            }
        });
    }
    
    // Botão para finalizar solicitação
    const finalizeRequestBtn = document.getElementById('finalize-request');
    if (finalizeRequestBtn) {
        finalizeRequestBtn.addEventListener('click', () => {
            const products = requestService.getAllProducts();
            if (products.length > 0) {
                if (confirm('Deseja finalizar esta solicitação de compras?')) {
                    requestService.createPendingRequest();
                    
                    // Atualizar tabelas
                    updateTables();
                    
                    // Resetar formulário
                    forms.resetForm();
                }
            } else {
                notifications.showToast('Adicione pelo menos um produto à solicitação.', 'error');
            }
        });
    }
    
    console.log('Ações configuradas');
}

/**
 * Carrega dados iniciais
 */
function loadInitialData() {
    // Carregar dados do localStorage
    dataManager.loadFromLocalStorage();
    
    // Atualizar tabelas com dados carregados
    updateTables();
    
    console.log('Dados iniciais carregados');
}

/**
 * Atualiza todas as tabelas
 */
function updateTables() {
    // Atualizar tabela de produtos
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        const products = requestService.getAllProducts();
        tables.updateProductsTable(productsTable, products, {
            onRemove: handleRemoveProduct
        });
    }
    
    // Atualizar tabela de solicitações pendentes
    const pendingRequestsTable = document.getElementById('pending-requests-table');
    if (pendingRequestsTable) {
        const requests = requestService.getAllRequests();
        tables.updatePendingRequestsTable(pendingRequestsTable, requests, {
            onViewDetails: handleViewRequestDetails
        });
    }
    
    // Atualizar botão de finalizar
    updateFinalizeButton();
}

/**
 * Atualiza o estado do botão de finalizar
 */
function updateFinalizeButton() {
    const finalizeRequestBtn = document.getElementById('finalize-request');
    if (finalizeRequestBtn) {
        const products = requestService.getAllProducts();
        finalizeRequestBtn.disabled = products.length === 0;
    }
}

/**
 * Handlers para eventos
 */

function handleFormSubmit(formData) {
    // Adicionar produto
    requestService.addProduct(formData);
    
    // Atualizar tabelas
    updateTables();
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
    
    // Resetar formulário, mantendo fornecedor e liga
    forms.resetForm(true);
}

function handleFormChange(field, value) {
    // Salvar estado do formulário
    const formData = forms.getFormData();
    dataManager.saveFormState(formData);
}

function handleRemoveProduct(productId) {
    requestService.removeProduct(productId);
    
    // Atualizar tabelas
    updateTables();
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
}

function handleDayClick(date, productsForDate) {
    calendar.updateDayDetails(date);
}

function handleMonthChange(newDate) {
    // Nada a fazer aqui por enquanto
}

function handleEditProduct(product) {
    const editDateModal = document.getElementById('edit-date-modal');
    if (editDateModal) {
        const modal = modals.registerModal('editDateModal', editDateModal);
        if (modal) {
            modal.open(product);
        }
    }
}

function handleDeliveryDateUpdate(productId, newDate) {
    requestService.updateDeliveryDate(productId, newDate);
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
    
    // Atualizar tabelas
    updateTables();
}

function handleViewRequestDetails(requestId) {
    const request = requestService.getRequestDetails(requestId);
    if (request) {
        const requestDetailsModal = document.getElementById('request-details-modal');
        if (requestDetailsModal) {
            const modal = modals.registerModal('requestDetailsModal', requestDetailsModal);
            if (modal) {
                modal.open(request);
            }
        }
    }
}

function handleApproveRequest(requestId) {
    requestService.approveRequest(requestId);
    updateTables();
}

function handleRejectRequest(requestId) {
    requestService.rejectRequest(requestId);
    updateTables();
}

function handleReviewRequest(requestId, notes) {
    requestService.sendToReview(requestId, notes);
    updateTables();
}

function handlePrintRequest(requestId) {
    requestService.printRequestById(requestId);
}

function handleEmailRequest(requestId) {
    requestService.emailRequestById(requestId);
}

function handleRequestCreated(request) {
    updateTables();
}

function handleRequestUpdated(request) {
    updateTables();
}

function handleProductAdded(product) {
    updateTables();
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
}

function handleProductRemoved(productId) {
    updateTables();
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
}

function handleProductUpdated(product) {
    updateTables();
    
    // Atualizar calendário
    const products = requestService.getAllProducts();
    calendar.updateProducts(products);
}

// Expor funções globalmente para uso nos event handlers inline
window.removeProduct = handleRemoveProduct;
window.viewRequestDetails = handleViewRequestDetails;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);
