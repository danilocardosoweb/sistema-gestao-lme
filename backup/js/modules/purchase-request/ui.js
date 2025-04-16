/**
 * Módulo de UI para a funcionalidade de Solicitação de Compras
 * Contém funções relacionadas à manipulação da interface do usuário
 */

import { formatNumber, formatDate } from './data.js';
import { saveProducts, savePendingRequests } from './storage.js';

/**
 * Atualiza a tabela de produtos
 * @param {Array} products - Lista de produtos
 * @param {HTMLElement} tbody - Elemento tbody da tabela
 * @param {HTMLElement} totalProductsEl - Elemento para exibir total de produtos
 * @param {HTMLElement} totalWeightEl - Elemento para exibir peso total
 */
export function updateProductsTable(products, tbody, totalProductsEl, totalWeightEl) {
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let totalWeightValue = 0;

    products.forEach(product => {
        totalWeightValue += product.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.supplier}</td>
            <td>${product.alloy}</td>
            <td>${product.productDescription}</td>
            <td>${product.purchaseType}</td>
            <td>${formatNumber(product.quantity)}</td>
            <td>${formatDate(product.deliveryDate)}</td>
            <td>
                <button class="btn-danger" onclick="removeProduct(${product.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (totalWeightEl) {
        totalWeightValue = formatNumber(totalWeightValue);
        totalWeightEl.textContent = `${totalWeightValue} kg`;
    }
    
    // Salvar produtos após atualizar a tabela
    saveProducts(products);
}

/**
 * Atualiza a tabela de solicitações pendentes
 * @param {Array} pendingRequests - Lista de solicitações pendentes
 * @param {HTMLElement} pendingRequestsTable - Elemento tbody da tabela
 */
export function updatePendingRequestsTable(pendingRequests, pendingRequestsTable) {
    if (!pendingRequestsTable) return;
    
    pendingRequestsTable.innerHTML = '';
    pendingRequests.forEach(request => {
        const totalQuantity = request.products.reduce((sum, product) => sum + product.quantity, 0);
        const formattedDate = formatDate(request.date);
        
        // Verificar os tipos de compra na solicitação
        const purchaseTypes = [...new Set(request.products.map(product => product.purchaseType))];
        const typesString = purchaseTypes.join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${request.id}</td>
            <td>${formattedDate}</td>
            <td>${request.products.length} item(s)</td>
            <td>${formatNumber(totalQuantity)} kg</td>
            <td>${typesString}</td>
            <td><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></td>
            <td>
                <button class="btn-outline-primary" onclick="viewRequestDetails(${request.id})">
                    <i class="bi bi-eye"></i>
                    Detalhes
                </button>
            </td>
        `;
        pendingRequestsTable.appendChild(row);
    });
    
    // Salvar solicitações pendentes após atualizar a tabela
    savePendingRequests(pendingRequests);
}

/**
 * Atualiza os selects de liga e descrição com base no fornecedor selecionado
 * @param {Object} productData - Dados de produtos por fornecedor
 * @param {HTMLElement} supplierSelect - Select de fornecedor
 * @param {HTMLElement} alloySelect - Select de liga
 * @param {HTMLElement} productDescriptionSelect - Select de descrição
 */
export function updateAlloyOptions(productData, supplierSelect, alloySelect, productDescriptionSelect) {
    const supplier = supplierSelect.value;
    
    // Limpar select de liga
    alloySelect.innerHTML = '<option value="">Selecione a liga</option>';
    
    // Limpar e desabilitar select de descrição
    productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
    productDescriptionSelect.disabled = true;
    
    // Se não tiver fornecedor selecionado, desabilitar select de liga
    if (!supplier) {
        alloySelect.disabled = true;
        return;
    }
    
    // Habilitar select de liga
    alloySelect.disabled = false;
    
    // Preencher opções de liga para o fornecedor selecionado
    if (productData[supplier]) {
        const alloys = Object.keys(productData[supplier]);
        alloys.forEach(alloy => {
            const option = document.createElement('option');
            option.value = alloy;
            option.textContent = alloy;
            alloySelect.appendChild(option);
        });
    }
}

/**
 * Atualiza as descrições de produtos com base no fornecedor e liga selecionados
 * @param {Object} productData - Dados de produtos por fornecedor
 * @param {HTMLElement} supplierSelect - Select de fornecedor
 * @param {HTMLElement} alloySelect - Select de liga
 * @param {HTMLElement} productDescriptionSelect - Select de descrição
 */
export function updateProductDescriptions(productData, supplierSelect, alloySelect, productDescriptionSelect) {
    const supplier = supplierSelect.value;
    const alloy = alloySelect.value;
    
    // Limpar select de descrição
    productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
    
    // Se não tiver fornecedor ou liga selecionados, desabilitar select de descrição
    if (!supplier || !alloy) {
        productDescriptionSelect.disabled = true;
        return;
    }
    
    // Se existirem dados para esta combinação
    if (productData[supplier] && productData[supplier][alloy]) {
        // Se houver apenas uma descrição, selecionar automaticamente
        if (productData[supplier][alloy].length === 1) {
            const description = productData[supplier][alloy][0];
            const option = document.createElement('option');
            option.value = description;
            option.textContent = description;
            option.selected = true;
            productDescriptionSelect.appendChild(option);
            productDescriptionSelect.disabled = false;
        } 
        // Se houver múltiplas descrições (embora no momento só temos uma por liga)
        else {
            productData[supplier][alloy].forEach(description => {
                const option = document.createElement('option');
                option.value = description;
                option.textContent = description;
                productDescriptionSelect.appendChild(option);
            });
            
            // Selecionar automaticamente a primeira opção
            if (productDescriptionSelect.options.length > 1) {
                productDescriptionSelect.options[1].selected = true;
            }
            
            productDescriptionSelect.disabled = false;
        }
    } else {
        productDescriptionSelect.disabled = true;
    }
}

/**
 * Exibe um toast (mensagem temporária)
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de toast (success, error, warning, info)
 */
export function showToast(message, type = 'success') {
    // Verificar se já existe um toast container
    let toastContainer = document.querySelector('.toast-container');
    
    // Se não existir, criar um
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Criar o toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 
                          type === 'error' ? 'bi-x-circle' : 
                          type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle'}"></i>
            <div class="message">
                <span class="text">${message}</span>
            </div>
        </div>
        <i class="bi bi-x close"></i>
    `;
    
    // Adicionar o toast ao container
    toastContainer.appendChild(toast);
    
    // Adicionar evento de fechamento
    const closeBtn = toast.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 500);
        });
    }
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
} 