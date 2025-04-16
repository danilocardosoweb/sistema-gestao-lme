/**
 * Módulo para gerenciamento do calendário
 * @module calendar
 */

import { formatMonthYear, getDayOfWeekShortName, isSameDay, getFirstDayOfMonth, getLastDayOfMonth, addDays } from '../utils/date-utils.js';

/**
 * Configurações do calendário
 * @type {Object}
 */
let config = {
    dayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    highlightToday: true,
    firstDayOfWeek: 0, // 0 = Domingo, 1 = Segunda
    weekendDays: [0, 6], // Domingo e Sábado
    showWeekNumbers: false
};

/**
 * Elementos do calendário
 * @type {Object}
 */
let elements = {
    calendarModal: null,
    calendarGrid: null,
    currentMonthDisplay: null,
    prevMonthBtn: null,
    nextMonthBtn: null,
    dayDetailsContainer: null,
    closeModalBtn: null
};

/**
 * Estado atual do calendário
 * @type {Object}
 */
let state = {
    currentDate: new Date(),
    selectedDate: null,
    products: []
};

/**
 * Callbacks para eventos do calendário
 * @type {Object}
 */
let callbacks = {
    onDateSelect: null,
    onMonthChange: null,
    onDayClick: null
};

/**
 * Inicializa o módulo de calendário
 * @param {Object} calendarElements - Elementos do calendário
 * @param {Object} customConfig - Configurações personalizadas
 * @param {Object} eventCallbacks - Callbacks para eventos
 * @param {Array} initialProducts - Produtos iniciais para exibir no calendário
 */
export function initCalendar(calendarElements, customConfig = {}, eventCallbacks = {}, initialProducts = []) {
    elements = { ...elements, ...calendarElements };
    config = { ...config, ...customConfig };
    callbacks = { ...callbacks, ...eventCallbacks };
    state.products = [...initialProducts];
    
    // Verificar se os elementos essenciais existem
    if (!elements.calendarModal || !elements.calendarGrid || !elements.currentMonthDisplay) {
        console.error('Elementos essenciais do calendário não encontrados');
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Renderizar o calendário inicial
    updateCalendar();
    
    console.log('Módulo de calendário inicializado');
}

/**
 * Configura os event listeners do calendário
 */
function setupEventListeners() {
    // Botão de mês anterior
    if (elements.prevMonthBtn) {
        elements.prevMonthBtn.addEventListener('click', function() {
            // Navegar para o mês anterior
            state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1);
            updateCalendar();
            
            if (callbacks.onMonthChange) {
                callbacks.onMonthChange(state.currentDate);
            }
            
            console.log('Navegou para o mês anterior:', formatMonthYear(state.currentDate));
        });
    }
    
    // Botão de próximo mês
    if (elements.nextMonthBtn) {
        elements.nextMonthBtn.addEventListener('click', function() {
            // Navegar para o próximo mês
            state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1);
            updateCalendar();
            
            if (callbacks.onMonthChange) {
                callbacks.onMonthChange(state.currentDate);
            }
            
            console.log('Navegou para o próximo mês:', formatMonthYear(state.currentDate));
        });
    }
    
    // Botão de fechar o modal do calendário
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', function() {
            hideCalendar();
        });
    }
    
    // Fechar modal do calendário ao clicar fora
    if (elements.calendarModal) {
        elements.calendarModal.addEventListener('click', function(e) {
            if (e.target === elements.calendarModal) {
                hideCalendar();
            }
        });
    }
    
    // Fechar modal do calendário com a tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.calendarModal && elements.calendarModal.style.display === 'flex') {
            hideCalendar();
        }
    });
}

/**
 * Atualiza o calendário
 * @param {Date} [newDate] - Nova data para exibir (opcional)
 */
export function updateCalendar(newDate) {
    if (newDate) {
        state.currentDate = new Date(newDate);
    }
    
    if (!elements.calendarGrid || !elements.currentMonthDisplay) {
        console.error('Elementos do calendário não encontrados');
        return;
    }
    
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    // Atualizar exibição do mês atual
    elements.currentMonthDisplay.textContent = formatMonthYear(state.currentDate);
    
    // Limpar grid do calendário
    elements.calendarGrid.innerHTML = '';
    
    // Adicionar cabeçalho dos dias da semana
    for (let i = 0; i < 7; i++) {
        const dayIndex = (i + config.firstDayOfWeek) % 7;
        const dayName = config.dayNames[dayIndex];
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = dayName;
        
        if (config.weekendDays.includes(dayIndex)) {
            dayHeader.classList.add('weekend');
        }
        
        elements.calendarGrid.appendChild(dayHeader);
    }
    
    // Obter o primeiro dia do mês e o último dia do mês
    const firstDay = getFirstDayOfMonth(state.currentDate);
    const lastDay = getLastDayOfMonth(state.currentDate);
    
    // Ajustar o primeiro dia para começar no dia da semana correto
    let startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = (firstDayOfWeek - config.firstDayOfWeek + 7) % 7;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Criar as células do calendário (6 semanas x 7 dias)
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = isSameDay(currentDate, new Date());
        const isSelected = state.selectedDate && isSameDay(currentDate, state.selectedDate);
        const isWeekend = config.weekendDays.includes(currentDate.getDay());
        
        // Verificar se há produtos para esta data
        const productsForDate = getProductsForDate(currentDate);
        const hasProducts = productsForDate.length > 0;
        
        // Criar célula do dia
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = currentDate.toISOString();
        
        if (!isCurrentMonth) dayCell.classList.add('other-month');
        if (isToday && config.highlightToday) dayCell.classList.add('today');
        if (isSelected) dayCell.classList.add('selected');
        if (isWeekend) dayCell.classList.add('weekend');
        if (hasProducts) dayCell.classList.add('has-products');
        
        // Adicionar número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDate.getDate();
        dayCell.appendChild(dayNumber);
        
        // Adicionar indicador de produtos se houver
        if (hasProducts) {
            const indicator = document.createElement('div');
            indicator.className = 'product-indicator';
            indicator.textContent = productsForDate.length;
            dayCell.appendChild(indicator);
        }
        
        // Adicionar event listener para clique no dia
        dayCell.addEventListener('click', function() {
            // Remover seleção anterior
            const previousSelected = elements.calendarGrid.querySelector('.calendar-day.selected');
            if (previousSelected) {
                previousSelected.classList.remove('selected');
            }
            
            // Adicionar seleção ao dia clicado
            dayCell.classList.add('selected');
            
            // Atualizar data selecionada
            state.selectedDate = currentDate;
            
            // Atualizar detalhes do dia
            updateDayDetails(currentDate);
            
            // Chamar callback se existir
            if (callbacks.onDayClick) {
                callbacks.onDayClick(currentDate, productsForDate);
            }
        });
        
        // Adicionar célula ao grid
        elements.calendarGrid.appendChild(dayCell);
    }
    
    // Se houver uma data selecionada, atualizar os detalhes
    if (state.selectedDate) {
        updateDayDetails(state.selectedDate);
    }
}

/**
 * Atualiza os detalhes do dia selecionado
 * @param {Date} date - Data selecionada
 */
export function updateDayDetails(date) {
    if (!elements.dayDetailsContainer) {
        console.error('Container de detalhes do dia não encontrado');
        return;
    }
    
    // Limpar container
    elements.dayDetailsContainer.innerHTML = '';
    
    // Obter produtos para a data
    const productsForDate = getProductsForDate(date);
    
    // Criar cabeçalho
    const header = document.createElement('div');
    header.className = 'day-details-header';
    
    const dateTitle = document.createElement('h3');
    dateTitle.textContent = `${getDayOfWeekShortName(date)}, ${date.getDate()} de ${config.monthNames[date.getMonth()]} de ${date.getFullYear()}`;
    header.appendChild(dateTitle);
    
    elements.dayDetailsContainer.appendChild(header);
    
    // Criar lista de produtos
    if (productsForDate.length > 0) {
        const productsList = document.createElement('div');
        productsList.className = 'day-products-list';
        
        productsForDate.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'day-product-item';
            
            const productInfo = document.createElement('div');
            productInfo.className = 'product-info';
            productInfo.innerHTML = `
                <div class="product-supplier">${product.supplier}</div>
                <div class="product-description">${product.productDescription}</div>
                <div class="product-quantity">${product.quantity} kg</div>
            `;
            
            productItem.appendChild(productInfo);
            
            // Adicionar botão de editar se necessário
            if (callbacks.onEditProduct) {
                const editButton = document.createElement('button');
                editButton.className = 'edit-product-btn';
                editButton.innerHTML = '<i class="bi bi-pencil"></i>';
                editButton.addEventListener('click', () => {
                    callbacks.onEditProduct(product);
                });
                
                productItem.appendChild(editButton);
            }
            
            productsList.appendChild(productItem);
        });
        
        elements.dayDetailsContainer.appendChild(productsList);
    } else {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-day-message';
        emptyMessage.textContent = 'Nenhum produto programado para esta data.';
        
        elements.dayDetailsContainer.appendChild(emptyMessage);
    }
}

/**
 * Obtém os produtos para uma data específica
 * @param {Date} date - Data para buscar produtos
 * @returns {Array} Lista de produtos para a data
 */
export function getProductsForDate(date) {
    return state.products.filter(product => {
        const productDate = new Date(product.deliveryDate);
        return isSameDay(productDate, date);
    });
}

/**
 * Atualiza a lista de produtos do calendário
 * @param {Array} products - Nova lista de produtos
 */
export function updateProducts(products) {
    state.products = [...products];
    updateCalendar();
}

/**
 * Exibe o calendário
 */
export function showCalendar() {
    if (elements.calendarModal) {
        elements.calendarModal.style.display = 'flex';
        updateCalendar();
    }
}

/**
 * Esconde o calendário
 */
export function hideCalendar() {
    if (elements.calendarModal) {
        elements.calendarModal.style.display = 'none';
    }
}

/**
 * Seleciona uma data específica no calendário
 * @param {Date} date - Data a ser selecionada
 */
export function selectDate(date) {
    state.selectedDate = new Date(date);
    state.currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    updateCalendar();
    
    // Encontrar e clicar na célula correspondente à data
    setTimeout(() => {
        const dateString = date.toISOString();
        const dayCell = elements.calendarGrid.querySelector(`.calendar-day[data-date="${dateString}"]`);
        
        if (dayCell) {
            dayCell.click();
        }
    }, 0);
}
