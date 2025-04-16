/**
 * Módulo de calendário para a funcionalidade de Solicitação de Compras
 * Gerencia a visualização e interação com o calendário
 */

import { formatNumber, formatDate, formatMonthYear } from './data.js';
import { showToast } from './ui.js';

/**
 * Atualiza o calendário
 * @param {Date} currentDate - Data atual
 * @param {Date} selectedDate - Data selecionada
 * @param {Array} products - Lista de produtos
 * @param {HTMLElement} calendarEl - Elemento do calendário
 * @param {HTMLElement} currentMonthDisplay - Elemento para exibir mês atual
 */
export function updateCalendar(currentDate, selectedDate, products, calendarEl, currentMonthDisplay) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Limpar o conteúdo atual
    calendarEl.innerHTML = '';
    
    // Criar container do calendário
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-modal';
    
    // Criar o conteúdo do calendário
    const calendarContent = document.createElement('div');
    calendarContent.id = 'calendar';
    
    // Criar cabeçalho com título e botão de fechar
    const headerContainer = document.createElement('div');
    headerContainer.className = 'calendar-header-container';
    headerContainer.innerHTML = `
        <h2>Calendário de Entregas</h2>
        <div class="month-navigation">
            <button id="prev-month" class="nav-button">
                <i class="bi bi-chevron-left"></i>
            </button>
            <span id="current-month-display">${formatMonthYear(currentDate)}</span>
            <button id="next-month" class="nav-button">
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>
        <button class="close-modal">×</button>
    `;
    calendarContent.appendChild(headerContainer);
    
    // Adicionar cabeçalho dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const header = document.createElement('div');
    header.className = 'calendar-header';
    weekDays.forEach(day => {
        const span = document.createElement('span');
        span.textContent = day;
        header.appendChild(span);
    });
    calendarContent.appendChild(header);

    // Criar grade do calendário
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Calcular dias
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    createCalendarGrid(
        calendarGrid,
        startingDay,
        totalDays,
        year,
        month,
        selectedDate,
        products
    );
    
    calendarContent.appendChild(calendarGrid);
    calendarContainer.appendChild(calendarContent);
    calendarEl.appendChild(calendarContainer);

    // Adicionar evento de clique fora para fechar
    calendarContainer.addEventListener('click', (e) => {
        if (e.target === calendarContainer) {
            calendarContainer.style.display = 'none';
        }
    });

    // Adicionar evento ao botão de fechar
    const closeBtn = headerContainer.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            calendarContainer.style.display = 'none';
        });
    }

    // Prevenir que cliques dentro do calendário fechem o modal
    calendarContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/**
 * Cria a grade do calendário
 * @private
 */
function createCalendarGrid(calendarEl, startingDay, totalDays, year, month, selectedDate, products) {
    let currentWeek = 1;
    let dayCount = 1;
    let weekDiv = createWeekDiv(currentWeek);

    // Adicionar células vazias no início
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        weekDiv.appendChild(emptyDay);
    }

    // Preencher os dias do mês
    while (dayCount <= totalDays) {
        if ((dayCount + startingDay - 1) % 7 === 0 && dayCount !== 1) {
            calendarEl.appendChild(weekDiv);
            currentWeek++;
            weekDiv = createWeekDiv(currentWeek);
        }

        const date = new Date(year, month, dayCount);
        const dayProducts = getProductsForDate(date, products);
        
        const dayEl = createDayElement(date, dayProducts, selectedDate);
        weekDiv.appendChild(dayEl);
        dayCount++;
    }

    calendarEl.appendChild(weekDiv);
}

/**
 * Cria um elemento div para uma semana
 * @private
 */
function createWeekDiv(weekNumber) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'calendar-week';
    
    const weekNumberEl = document.createElement('div');
    weekNumberEl.className = 'week-number';
    weekNumberEl.textContent = weekNumber;
    weekDiv.appendChild(weekNumberEl);
    
    return weekDiv;
}

/**
 * Cria um elemento div para um dia
 * @private
 */
function createDayElement(date, dayProducts, selectedDate) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (dayProducts.length > 0) {
        dayEl.classList.add('has-products');
    }
    
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        dayEl.classList.add('selected');
    }

    dayEl.innerHTML = `
        <div class="day-number">${date.getDate()}</div>
        ${dayProducts.length > 0 ? 
            `<div class="product-count">${dayProducts.length} carga${dayProducts.length > 1 ? 's' : ''}</div>` 
            : ''}
    `;

    // Adicionar data como atributo para uso no evento de clique
    dayEl.dataset.date = date.toISOString();

    // Adicionar evento de clique
    dayEl.addEventListener('click', () => {
        // Remover seleção anterior
        const previousSelected = document.querySelector('.calendar-day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Adicionar seleção atual
        dayEl.classList.add('selected');
        
        // Disparar evento customizado
        const event = new CustomEvent('daySelected', { 
            detail: { date, products: dayProducts }
        });
        document.dispatchEvent(event);
    });

    return dayEl;
}

/**
 * Atualiza os detalhes do dia selecionado
 * @param {Date} date - Data selecionada
 * @param {Array} products - Lista de produtos
 * @param {HTMLElement} selectedDateSpan - Elemento para exibir a data selecionada
 * @param {HTMLElement} dayProductsEl - Elemento para exibir produtos do dia
 * @param {Function} onEditClick - Função a ser chamada ao clicar em editar
 */
export function updateDayDetails(date, products, selectedDateSpan, dayProductsEl, onEditClick) {
    const dayProducts = getProductsForDate(date, products);
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }).format(date);

    selectedDateSpan.textContent = formattedDate;
    dayProductsEl.innerHTML = '';

    if (dayProducts.length === 0) {
        dayProductsEl.innerHTML = '<p class="no-products">Nenhuma carga programada para este dia.</p>';
        return;
    }

    let totalKg = 0;
    dayProducts.forEach(product => {
        totalKg += parseFloat(product.quantity);
        const productEl = createProductElement(product, onEditClick);
        dayProductsEl.appendChild(productEl);
    });

    // Adicionar total do dia
    const totalEl = createTotalElement(totalKg);
    dayProductsEl.appendChild(totalEl);
}

/**
 * Cria um elemento para exibir um produto
 * @private
 */
function createProductElement(product, onEditClick) {
    const productEl = document.createElement('div');
    productEl.className = 'day-product-item';
    productEl.innerHTML = `
        <div class="product-details">
            <h5>${product.supplier} - ${product.alloy}</h5>
            <p>${product.productDescription}</p>
            <p>${formatNumber(product.quantity)} kg - ${product.purchaseType}</p>
        </div>
        <div class="product-actions">
            <button class="btn-edit" data-id="${product.id}">
                <i class="bi bi-calendar-plus"></i>
            </button>
        </div>
    `;

    const editBtn = productEl.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => onEditClick(product));

    return productEl;
}

/**
 * Cria um elemento para exibir o total do dia
 * @private
 */
function createTotalElement(totalKg) {
    const totalEl = document.createElement('div');
    totalEl.className = 'day-product-item total';
    totalEl.innerHTML = `
        <div class="product-details">
            <h5>Total do Dia</h5>
            <p>${formatNumber(totalKg)} kg</p>
        </div>
    `;
    return totalEl;
}

/**
 * Obtém os produtos para uma data específica
 * @param {Date} date - Data para buscar produtos
 * @param {Array} products - Lista de produtos
 * @returns {Array} Lista de produtos para a data
 */
export function getProductsForDate(date, products) {
    return products.filter(product => {
        const productDate = new Date(product.deliveryDate);
        return productDate.toDateString() === date.toDateString();
    });
} 