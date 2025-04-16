/**
 * Módulo principal da funcionalidade de Solicitação de Compras
 * Integra todos os módulos e inicializa a aplicação
 */

import { initialState } from './data.js';
import { loadAllData } from './storage.js';
import { initializeEventListeners, removeProduct, viewRequestDetails } from './events.js';
import { updateCalendar, updateDayDetails, getProductsForDate } from './calendar.js';
import { printRequest, emailRequest } from './export.js';

// Estado global da aplicação
let state = {
    ...initialState,
    formData: {},
    currentDate: new Date(),
    selectedDate: null
};

/**
 * Inicializa a aplicação
 */
function initializeApp() {
    // Carregar dados salvos
    const savedData = loadAllData();
    
    // Atualizar estado com dados salvos
    state = {
        ...state,
        products: savedData.products || [],
        pendingRequests: savedData.pendingRequests || [],
        formData: savedData.formData || {}
    };
    
    // Inicializar event listeners
    initializeEventListeners(state);
    
    // Inicializar calendário
    const calendarEl = document.getElementById('calendar');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const selectedDateSpan = document.getElementById('selected-date');
    const dayProductsEl = document.getElementById('day-products');
    
    if (calendarEl && currentMonthDisplay) {
        updateCalendar(state.currentDate, state.selectedDate, state.products, calendarEl, currentMonthDisplay);
        
        // Event listeners do calendário
        document.getElementById('prev-month')?.addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() - 1);
            updateCalendar(state.currentDate, state.selectedDate, state.products, calendarEl, currentMonthDisplay);
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() + 1);
            updateCalendar(state.currentDate, state.selectedDate, state.products, calendarEl, currentMonthDisplay);
        });

        // Event listener para seleção de dia
        document.addEventListener('daySelected', (event) => {
            state.selectedDate = event.detail.date;
            if (selectedDateSpan && dayProductsEl) {
                updateDayDetails(
                    event.detail.date,
                    state.products,
                    selectedDateSpan,
                    dayProductsEl,
                    (product) => {
                        // Função chamada ao clicar em editar
                        console.log('Editar produto:', product);
                        // Aqui você pode implementar a lógica de edição
                    }
                );
            }
        });
    }
    
    // Expor funções globalmente para uso nos event handlers inline
    window.removeProduct = (productId) => {
        const productsTableBody = document.querySelector('#productsTable tbody');
        const totalProductsEl = document.getElementById('totalProducts');
        const totalWeightEl = document.getElementById('totalWeight');
        removeProduct(productId, state, productsTableBody, totalProductsEl, totalWeightEl);
        
        // Atualizar calendário após remover produto
        if (calendarEl && currentMonthDisplay) {
            updateCalendar(state.currentDate, state.selectedDate, state.products, calendarEl, currentMonthDisplay);
        }
    };
    
    window.viewRequestDetails = (requestId) => {
        viewRequestDetails(requestId, state);
    };
    
    window.printRequest = () => {
        const currentRequest = state.pendingRequests.find(r => r.id === state.currentRequestId);
        if (currentRequest) {
            printRequest(currentRequest);
        }
    };
    
    window.emailRequest = () => {
        const currentRequest = state.pendingRequests.find(r => r.id === state.currentRequestId);
        if (currentRequest) {
            emailRequest(currentRequest);
        }
    };
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp); 