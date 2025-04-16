/**
 * Módulo para renderização e manipulação de tabelas
 * @module tables
 */

import { formatDate } from '../utils/date-utils.js';
import { formatNumber, getStatusColor } from '../utils/format-utils.js';

/**
 * Configurações padrão para tabelas
 * @type {Object}
 */
const defaultConfig = {
    emptyMessage: 'Nenhum registro encontrado',
    loadingMessage: 'Carregando...',
    tableClass: 'data-table',
    headerClass: 'table-header',
    bodyClass: 'table-body',
    rowClass: 'table-row',
    cellClass: 'table-cell',
    actionsCellClass: 'actions-cell',
    sortableClass: 'sortable',
    sortAscClass: 'sort-asc',
    sortDescClass: 'sort-desc',
    paginationClass: 'table-pagination'
};

/**
 * Configuração atual
 * @type {Object}
 */
let config = { ...defaultConfig };

/**
 * Inicializa o módulo de tabelas
 * @param {Object} customConfig - Configurações personalizadas
 */
export function initTables(customConfig = {}) {
    config = { ...defaultConfig, ...customConfig };
    console.log('Módulo de tabelas inicializado');
}

/**
 * Atualiza a tabela de produtos
 * @param {HTMLElement} tableElement - Elemento da tabela
 * @param {Array} products - Lista de produtos
 * @param {Object} options - Opções de configuração
 */
export function updateProductsTable(tableElement, products, options = {}) {
    if (!tableElement) {
        console.error('Elemento da tabela de produtos não encontrado');
        return;
    }
    
    const tbody = tableElement.querySelector('tbody');
    if (!tbody) {
        console.error('Corpo da tabela de produtos não encontrado');
        return;
    }
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Verificar se há produtos
    if (!products || products.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="empty-message">${config.emptyMessage}</td>`;
        tbody.appendChild(emptyRow);
        return;
    }
    
    // Adicionar produtos à tabela
    let totalWeight = 0;
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.id = product.id;
        
        // Adicionar peso ao total
        if (typeof product.quantity === 'number') {
            totalWeight += product.quantity;
        }
        
        // Criar células
        row.innerHTML = `
            <td>${product.supplier || ''}</td>
            <td>${product.alloy || ''}</td>
            <td>${product.productDescription || ''}</td>
            <td>${product.purchaseType || ''}</td>
            <td>${typeof product.quantity === 'number' ? formatNumber(product.quantity) + ' kg' : product.quantity || ''}</td>
            <td>${typeof product.deliveryDate === 'string' ? product.deliveryDate : formatDate(product.deliveryDate)}</td>
            <td class="${config.actionsCellClass}">
                <button class="btn-icon btn-danger remove-product" data-id="${product.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        // Adicionar event listener para o botão de remover
        const removeButton = row.querySelector('.remove-product');
        if (removeButton && options.onRemove) {
            removeButton.addEventListener('click', () => {
                options.onRemove(product.id);
            });
        }
        
        tbody.appendChild(row);
    });
    
    // Adicionar linha de total
    if (products.length > 0) {
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
            <td><strong>${formatNumber(totalWeight)} kg</strong></td>
            <td colspan="2"></td>
        `;
        tbody.appendChild(totalRow);
    }
}

/**
 * Atualiza a tabela de solicitações pendentes
 * @param {HTMLElement} tableElement - Elemento da tabela
 * @param {Array} requests - Lista de solicitações
 * @param {Object} options - Opções de configuração
 */
export function updatePendingRequestsTable(tableElement, requests, options = {}) {
    if (!tableElement) {
        console.error('Elemento da tabela de solicitações não encontrado');
        return;
    }
    
    const tbody = tableElement.querySelector('tbody');
    if (!tbody) {
        console.error('Corpo da tabela de solicitações não encontrado');
        return;
    }
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Verificar se há solicitações
    if (!requests || requests.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="empty-message">${config.emptyMessage}</td>`;
        tbody.appendChild(emptyRow);
        return;
    }
    
    // Adicionar solicitações à tabela
    requests.forEach(request => {
        const row = document.createElement('tr');
        row.dataset.id = request.id;
        
        // Determinar a classe de status
        const statusClass = getStatusColor(request.status);
        
        // Criar células
        row.innerHTML = `
            <td>${request.id || ''}</td>
            <td>${typeof request.date === 'string' ? request.date : formatDate(request.date)}</td>
            <td>${request.totalProducts || 0}</td>
            <td>${typeof request.totalWeight === 'number' ? formatNumber(request.totalWeight) + ' kg' : request.totalWeight || ''}</td>
            <td>${request.purchaseType || ''}</td>
            <td><span class="status-badge ${statusClass}">${request.status || ''}</span></td>
            <td class="${config.actionsCellClass}">
                <button class="btn-icon btn-primary view-details" data-id="${request.id}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        
        // Adicionar event listener para o botão de detalhes
        const viewButton = row.querySelector('.view-details');
        if (viewButton && options.onViewDetails) {
            viewButton.addEventListener('click', () => {
                options.onViewDetails(request.id);
            });
        }
        
        tbody.appendChild(row);
    });
}

/**
 * Cria uma tabela dinâmica
 * @param {HTMLElement} container - Container para a tabela
 * @param {Object} tableConfig - Configuração da tabela
 * @returns {Object} API da tabela
 */
export function createDynamicTable(container, tableConfig) {
    if (!container) {
        console.error('Container da tabela não encontrado');
        return null;
    }
    
    const {
        columns,
        data = [],
        title = '',
        id = 'dynamic-table-' + Date.now(),
        sortable = true,
        pagination = false,
        pageSize = 10,
        actions = [],
        onRowClick = null,
        emptyMessage = config.emptyMessage
    } = tableConfig;
    
    // Verificar se as colunas foram definidas
    if (!columns || columns.length === 0) {
        console.error('Colunas não definidas para a tabela dinâmica');
        return null;
    }
    
    // Estado da tabela
    const state = {
        data: [...data],
        filteredData: [...data],
        sortColumn: null,
        sortDirection: 'asc',
        currentPage: 1,
        pageSize: pageSize
    };
    
    // Criar elementos da tabela
    container.innerHTML = '';
    
    // Criar cabeçalho da tabela
    const tableHeader = document.createElement('div');
    tableHeader.className = config.headerClass;
    tableHeader.innerHTML = `
        <h3>${title}</h3>
        <div class="table-actions">
            <div class="table-filter">
                <input type="text" id="${id}-filter" placeholder="Filtrar..." class="filter-input">
            </div>
            ${actions.map(action => `
                <button id="${action.id}" class="${action.class || 'btn-outline-primary'}">
                    ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                    ${action.label}
                </button>
            `).join('')}
        </div>
    `;
    
    container.appendChild(tableHeader);
    
    // Criar tabela
    const table = document.createElement('table');
    table.id = id;
    table.className = config.tableClass;
    
    // Criar cabeçalho da tabela
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.innerHTML = column.title;
        
        if (sortable && column.sortable !== false) {
            th.className = config.sortableClass;
            th.dataset.field = column.field;
            
            th.addEventListener('click', () => {
                // Alternar direção se a coluna já está selecionada
                if (state.sortColumn === column.field) {
                    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortColumn = column.field;
                    state.sortDirection = 'asc';
                }
                
                // Atualizar tabela
                renderTable();
            });
        }
        
        headerRow.appendChild(th);
    });
    
    // Adicionar coluna de ações se necessário
    if (actions.length > 0 || onRowClick) {
        const actionsHeader = document.createElement('th');
        actionsHeader.className = config.actionsCellClass;
        actionsHeader.textContent = 'Ações';
        headerRow.appendChild(actionsHeader);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    container.appendChild(table);
    
    // Criar paginação se necessário
    let paginationContainer = null;
    if (pagination) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = config.paginationClass;
        container.appendChild(paginationContainer);
    }
    
    // Função para renderizar a tabela
    function renderTable() {
        // Limpar corpo da tabela
        tbody.innerHTML = '';
        
        // Filtrar e ordenar dados
        let displayData = [...state.filteredData];
        
        // Ordenar dados
        if (state.sortColumn) {
            displayData.sort((a, b) => {
                const aValue = a[state.sortColumn];
                const bValue = b[state.sortColumn];
                
                // Comparar valores
                if (aValue < bValue) {
                    return state.sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return state.sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        // Aplicar paginação
        if (pagination) {
            const startIndex = (state.currentPage - 1) * state.pageSize;
            displayData = displayData.slice(startIndex, startIndex + state.pageSize);
        }
        
        // Atualizar cabeçalhos de ordenação
        const sortableHeaders = thead.querySelectorAll(`.${config.sortableClass}`);
        sortableHeaders.forEach(header => {
            header.classList.remove(config.sortAscClass, config.sortDescClass);
            
            if (header.dataset.field === state.sortColumn) {
                header.classList.add(state.sortDirection === 'asc' ? config.sortAscClass : config.sortDescClass);
            }
        });
        
        // Verificar se há dados
        if (displayData.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = columns.length + (actions.length > 0 || onRowClick ? 1 : 0);
            emptyCell.className = 'empty-message';
            emptyCell.textContent = emptyMessage;
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            
            // Atualizar paginação
            if (pagination) {
                renderPagination();
            }
            
            return;
        }
        
        // Renderizar linhas
        displayData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id || index;
            
            // Adicionar células
            columns.forEach(column => {
                const cell = document.createElement('td');
                
                // Obter valor da célula
                let value = item[column.field];
                
                // Aplicar formatação se necessário
                if (column.format) {
                    value = column.format(value, item);
                }
                
                // Renderizar célula
                if (column.render) {
                    cell.innerHTML = column.render(value, item);
                } else {
                    cell.textContent = value !== undefined && value !== null ? value : '';
                }
                
                // Adicionar classes
                if (column.cellClass) {
                    cell.className = column.cellClass;
                }
                
                row.appendChild(cell);
            });
            
            // Adicionar célula de ações se necessário
            if (actions.length > 0 || onRowClick) {
                const actionsCell = document.createElement('td');
                actionsCell.className = config.actionsCellClass;
                
                // Adicionar botões de ação
                actions.forEach(action => {
                    if (action.showCondition && !action.showCondition(item)) {
                        return;
                    }
                    
                    const button = document.createElement('button');
                    button.className = `btn-icon ${action.buttonClass || 'btn-primary'}`;
                    button.innerHTML = action.icon ? `<i class="${action.icon}"></i>` : action.label;
                    button.title = action.tooltip || action.label;
                    
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (action.onClick) {
                            action.onClick(item);
                        }
                    });
                    
                    actionsCell.appendChild(button);
                });
                
                row.appendChild(actionsCell);
            }
            
            // Adicionar event listener para clique na linha
            if (onRowClick) {
                row.classList.add('clickable');
                row.addEventListener('click', () => {
                    onRowClick(item);
                });
            }
            
            tbody.appendChild(row);
        });
        
        // Atualizar paginação
        if (pagination) {
            renderPagination();
        }
    }
    
    // Função para renderizar a paginação
    function renderPagination() {
        if (!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        
        const totalPages = Math.ceil(state.filteredData.length / state.pageSize);
        
        if (totalPages <= 1) {
            return;
        }
        
        // Criar controles de paginação
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-prev';
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = state.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTable();
            }
        });
        
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-next';
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = state.currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTable();
            }
        });
        
        const pageInfo = document.createElement('span');
        pageInfo.className = 'pagination-info';
        pageInfo.textContent = `Página ${state.currentPage} de ${totalPages}`;
        
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);
    }
    
    // Configurar filtro
    const filterInput = tableHeader.querySelector(`#${id}-filter`);
    if (filterInput) {
        filterInput.addEventListener('input', () => {
            const filterValue = filterInput.value.toLowerCase();
            
            if (filterValue === '') {
                state.filteredData = [...state.data];
            } else {
                state.filteredData = state.data.filter(item => {
                    return columns.some(column => {
                        const value = item[column.field];
                        if (value === undefined || value === null) {
                            return false;
                        }
                        return String(value).toLowerCase().includes(filterValue);
                    });
                });
            }
            
            state.currentPage = 1;
            renderTable();
        });
    }
    
    // Configurar botões de ação
    actions.forEach(action => {
        const button = tableHeader.querySelector(`#${action.id}`);
        if (button && action.onClick) {
            button.addEventListener('click', action.onClick);
        }
    });
    
    // Renderizar tabela inicial
    renderTable();
    
    // Retornar API da tabela
    return {
        refresh: (newData = null) => {
            if (newData) {
                state.data = [...newData];
                state.filteredData = [...newData];
            }
            renderTable();
        },
        filter: (filterFn) => {
            state.filteredData = state.data.filter(filterFn);
            state.currentPage = 1;
            renderTable();
        },
        sort: (column, direction = 'asc') => {
            state.sortColumn = column;
            state.sortDirection = direction;
            renderTable();
        },
        goToPage: (page) => {
            if (page >= 1 && page <= Math.ceil(state.filteredData.length / state.pageSize)) {
                state.currentPage = page;
                renderTable();
            }
        },
        getData: () => [...state.data],
        getFilteredData: () => [...state.filteredData]
    };
}

/**
 * Atualiza uma célula específica em uma tabela
 * @param {HTMLElement} tableElement - Elemento da tabela
 * @param {string|number} rowId - ID da linha
 * @param {string} columnIndex - Índice ou nome da coluna
 * @param {string} newValue - Novo valor
 */
export function updateTableCell(tableElement, rowId, columnIndex, newValue) {
    if (!tableElement) {
        console.error('Elemento da tabela não encontrado');
        return;
    }
    
    const row = tableElement.querySelector(`tr[data-id="${rowId}"]`);
    if (!row) {
        console.error(`Linha com ID ${rowId} não encontrada`);
        return;
    }
    
    // Se columnIndex for um número, usar como índice
    // Se for uma string, procurar pelo cabeçalho correspondente
    let cellIndex;
    
    if (typeof columnIndex === 'number') {
        cellIndex = columnIndex;
    } else {
        // Procurar pelo cabeçalho
        const headers = Array.from(tableElement.querySelectorAll('th'));
        cellIndex = headers.findIndex(th => th.textContent.trim() === columnIndex);
        
        if (cellIndex === -1) {
            console.error(`Coluna "${columnIndex}" não encontrada`);
            return;
        }
    }
    
    const cell = row.cells[cellIndex];
    if (!cell) {
        console.error(`Célula não encontrada na linha ${rowId}, coluna ${columnIndex}`);
        return;
    }
    
    cell.textContent = newValue;
}
