document.addEventListener('DOMContentLoaded', function() {
    // Dados de produtos por fornecedor e liga
    const productData = {
        CBA: {
            '6060': ['FT 6060 02 HO 177,8x6300 (02)'],
            '6063': ['FT 6063 02 HO 177,8x6300 (02)'],
            '6460': ['FT 6460B 02 HO 177,8x6300 (02)'],
            '6005': ['FT 6005A 02 HO 177,8x6300 (02)'],
            '6463': ['FT 6463 02 HO 177,8x6300 (02)'],
            '6082': ['FT 6082 04 HO 177,8x6300'],
            '6061': ['FT 6061 09 HO 177,8x6300'],
            '6351': ['FT 6351 02 HO 177,8x6300 (02)'],
            '6101': ['FT 6101 03 HO 177,8x6300 (02)']
        },
        ALCOA: {
            '6060': ['FT 6060 HO 177,8x5900'],
            '6063': ['FT 6063 HO 177,8x5900'],
            '6460': ['FT 6460B HO 177,8x5900'],
            '6005': ['FT 6005A HO 177,8x5900'],
            '6463': ['FT 6463 HO 177,8x5900'],
            '6082': ['FT 6082 HO 177,8x5900'],
            '6061': ['FT 6061 09 HO 177,8x5900'],
            '6351': ['FT 6351 HO 177,8x5900'],
            '6101': ['FT 6101 HO 177,8x5900']
        }
    };
    
    console.log('productData inicializado:', productData);

    // Elementos do formulário
    const purchaseForm = document.getElementById('purchase-form');
    if (!purchaseForm) {
        console.error('Formulário de compra não encontrado');
        return;
    }

    const supplierSelect = document.getElementById('supplier');
    const alloySelect = document.getElementById('alloy');
    const productDescriptionSelect = document.getElementById('product_description');
    
    if (!supplierSelect || !alloySelect || !productDescriptionSelect) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    // Função para atualizar as descrições de produtos
    function updateProductDescriptions() {
        const supplier = document.getElementById('supplier').value;
        const alloy = document.getElementById('alloy').value;
        const productDescriptionSelect = document.getElementById('product_description');
        
        console.log('Atualizando descrições:', { supplier, alloy });
        console.log('productData disponível:', productData);
        
        productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
        
        if (supplier && alloy && productData[supplier] && productData[supplier][alloy]) {
            console.log('Dados encontrados:', productData[supplier][alloy]);
            productData[supplier][alloy].forEach(description => {
                const option = document.createElement('option');
                option.value = description;
                option.textContent = description;
                productDescriptionSelect.appendChild(option);
            });
            productDescriptionSelect.disabled = false;
        } else {
            console.log('Nenhum dado encontrado para esta combinação');
            productDescriptionSelect.disabled = true;
        }
    }

    // Event listeners para atualização das descrições de produtos
    document.getElementById('supplier').addEventListener('change', function() {
        console.log('Fornecedor alterado:', this.value);
        updateProductDescriptions();
    });

    document.getElementById('alloy').addEventListener('change', function() {
        console.log('Liga alterada:', this.value);
        updateProductDescriptions();
    });

    // Inicializar as descrições de produtos
    updateProductDescriptions();
    
    // Elementos da tabela
    const productsTable = document.getElementById('products-table');
    const totalProducts = document.getElementById('total-products');
    const totalWeight = document.getElementById('total-weight');
    const tbody = productsTable ? productsTable.querySelector('tbody') : null;
    
    // Função para atualizar a tabela de produtos
    function updateProductsTable() {
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

        if (totalProducts) totalProducts.textContent = products.length;
        if (totalWeight) {
            totalWeightValue = formatNumber(totalWeightValue);
            totalWeight.textContent = `${totalWeightValue} kg`;
        }
        updateFinalizeButton();
    }

    // Elementos do calendário
    const calendarModal = document.getElementById('calendar-modal');
    const closeModal = document.querySelector('.close-modal');
    const viewCalendarBtn = document.getElementById('view-calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const calendarEl = document.getElementById('calendar');
    const dayDetailsEl = document.getElementById('day-details');

    // Array para armazenar os produtos
    let products = [];
    let currentDate = new Date();
    let selectedDate = null;
    let nextId = 1;
    let selectedProductId = null;

    // Elementos do modal de edição
    const editDateModal = document.getElementById('edit-date-modal');
    const newDeliveryDateInput = document.getElementById('new-delivery-date');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const confirmEditBtn = document.getElementById('confirm-edit');
    const editSupplierSpan = document.getElementById('edit-supplier');
    const editAlloySpan = document.getElementById('edit-alloy');
    const editQuantitySpan = document.getElementById('edit-quantity');
    const selectedDateSpan = document.querySelector('.selected-date');

    // Elementos do botão de finalizar
    const finalizeRequestBtn = document.getElementById('finalize-request');
    const pendingRequestsTableElement = document.getElementById('pending-requests-table');
    const pendingRequestsTable = pendingRequestsTableElement ? pendingRequestsTableElement.querySelector('tbody') : null;
    let pendingRequests = [];
    let nextPendingId = 1;

    // Elementos do modal de detalhes
    const requestDetailsModal = document.getElementById('request-details-modal');
    const requestIdSpan = document.getElementById('request-id');
    const requestDateSpan = document.getElementById('request-date');
    const requestStatusSpan = document.getElementById('request-status');
    const requestItemsTable = document.getElementById('request-items-table').querySelector('tbody');
    const reviewForm = document.querySelector('.review-form');
    
    // Botões de ação
    const approveBtn = document.getElementById('approve-request');
    const reviewBtn = document.getElementById('review-request');
    const rejectBtn = document.getElementById('reject-request');
    const submitReviewBtn = document.getElementById('submit-review');
    const cancelReviewBtn = document.getElementById('cancel-review');
    
    let currentRequestId = null;

    // Função para adicionar uma nova solicitação
    function addPurchaseRequest(request) {
        purchaseRequests.push({
            id: purchaseRequests.length + 1,
            ...request,
            status: 'Pendente',
            date: new Date().toISOString()
        });
        updatePurchaseRequestsTable();
    }

    // Função para atualizar a tabela de solicitações
    function updatePurchaseRequestsTable() {
        purchaseRequestsTable.innerHTML = '';
        purchaseRequests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.product}</td>
                <td>${request.quantity}</td>
                <td>${request.unit}</td>
                <td>
                    <span class="badge bg-${getPriorityColor(request.priority)}">
                        ${request.priority}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${getStatusColor(request.status)}">
                        ${request.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteRequest(${request.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            purchaseRequestsTable.appendChild(row);
        });
    }

    // Função para obter a cor do badge baseado na prioridade
    function getPriorityColor(priority) {
        switch(priority) {
            case 'alta': return 'danger';
            case 'media': return 'warning';
            case 'baixa': return 'success';
            default: return 'secondary';
        }
    }

    // Função para obter a cor do badge baseado no status
    function getStatusColor(status) {
        switch(status) {
            case 'Pendente': return 'warning';
            case 'Aprovado': return 'success';
            case 'Rejeitado': return 'danger';
            default: return 'secondary';
        }
    }

    // Função para atualizar o botão de finalizar
    function updateFinalizeButton() {
        finalizeRequestBtn.disabled = products.length === 0;
    }

    // Função para atualizar a tabela de solicitações pendentes
    function updatePendingRequestsTable() {
        if (!pendingRequestsTable) return;
        
        pendingRequestsTable.innerHTML = '';
        pendingRequests.forEach(request => {
            const totalQuantity = request.products.reduce((sum, product) => sum + product.quantity, 0);
            const formattedDate = formatDate(request.date);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${request.id}</td>
                <td>${formattedDate}</td>
                <td>${request.products.length} item(s)</td>
                <td>${formatNumber(totalQuantity)} kg</td>
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
    }

    // Função para visualizar detalhes da solicitação
    window.viewRequestDetails = function(requestId) {
        const request = pendingRequests.find(r => r.id === requestId);
        if (!request) return;

        currentRequestId = requestId;
        requestIdSpan.textContent = request.id;
        requestDateSpan.textContent = formatDate(request.date);
        requestStatusSpan.textContent = request.status;
        requestStatusSpan.className = `status-badge status-${request.status.toLowerCase()}`;

        // Preencher tabela de itens
        requestItemsTable.innerHTML = '';
        request.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.supplier}</td>
                <td>${product.alloy}</td>
                <td>${product.productDescription}</td>
                <td>${product.purchaseType}</td>
                <td>${formatNumber(product.quantity)}</td>
                <td>${formatDate(product.deliveryDate)}</td>
            `;
            requestItemsTable.appendChild(row);
        });

        // Mostrar/esconder botões baseado no status
        const showActionButtons = request.status === 'Pendente';
        approveBtn.style.display = showActionButtons ? 'inline-block' : 'none';
        reviewBtn.style.display = showActionButtons ? 'inline-block' : 'none';
        rejectBtn.style.display = showActionButtons ? 'inline-block' : 'none';

        // Esconder formulário de revisão
        reviewForm.style.display = 'none';

        requestDetailsModal.classList.add('active');
    };

    // Função para criar uma solicitação pendente
    function createPendingRequest() {
        if (!pendingRequestsTable) {
            console.warn('Tabela de solicitações pendentes não encontrada');
            return;
        }

        const pendingRequest = {
            id: nextPendingId++,
            products: [...products],
            date: new Date().toISOString(),
            status: 'Pendente',
            history: [{
                date: new Date().toISOString(),
                action: 'Criação',
                notes: 'Solicitação criada'
            }]
        };
        pendingRequests.push(pendingRequest);
        updatePendingRequestsTable();
        
        // Limpar produtos atuais
        products = [];
        updateProductsTable();
        updateCalendar();
        updateFinalizeButton();

        // Mostrar toast de sucesso
        showToast('Solicitação finalizada com sucesso!', 'success');
    }

    // Funções de ação nas solicitações
    function approveRequest() {
        const request = pendingRequests.find(r => r.id === currentRequestId);
        if (!request) return;

        request.status = 'Aprovado';
        request.history.push({
            date: new Date().toISOString(),
            action: 'Aprovação',
            notes: 'Solicitação aprovada'
        });

        updatePendingRequestsTable();
        requestDetailsModal.classList.remove('active');
        showToast('Solicitação aprovada com sucesso!', 'success');
    }

    function rejectRequest() {
        const request = pendingRequests.find(r => r.id === currentRequestId);
        if (!request) return;

        if (confirm('Tem certeza que deseja recusar esta solicitação?')) {
            request.status = 'Recusado';
            request.history.push({
                date: new Date().toISOString(),
                action: 'Recusa',
                notes: 'Solicitação recusada'
            });

            updatePendingRequestsTable();
            requestDetailsModal.classList.remove('active');
            showToast('Solicitação recusada.', 'warning');
        }
    }

    function showReviewForm() {
        reviewForm.style.display = 'block';
        document.querySelector('.request-actions').style.display = 'none';
    }

    function hideReviewForm() {
        reviewForm.style.display = 'none';
        document.querySelector('.request-actions').style.display = 'flex';
        document.getElementById('review-notes').value = '';
    }

    function submitReview() {
        const request = pendingRequests.find(r => r.id === currentRequestId);
        if (!request) return;

        const notes = document.getElementById('review-notes').value.trim();
        if (!notes) {
            alert('Por favor, adicione observações para a revisão.');
            return;
        }

        request.status = 'Em Revisão';
        request.history.push({
            date: new Date().toISOString(),
            action: 'Revisão Solicitada',
            notes: notes
        });

        updatePendingRequestsTable();
        requestDetailsModal.classList.remove('active');
        showToast('Solicitação enviada para revisão.', 'info');
    }

    // Função auxiliar para mostrar toasts
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="bi bi-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Event listeners para ações
    approveBtn.addEventListener('click', approveRequest);
    reviewBtn.addEventListener('click', showReviewForm);
    rejectBtn.addEventListener('click', rejectRequest);
    submitReviewBtn.addEventListener('click', submitReview);
    cancelReviewBtn.addEventListener('click', hideReviewForm);

    // Fechar modal de detalhes
    requestDetailsModal.querySelector('.close-modal').addEventListener('click', () => {
        requestDetailsModal.classList.remove('active');
    });

    // Fechar modal ao clicar fora
    requestDetailsModal.addEventListener('click', (e) => {
        if (e.target === requestDetailsModal) {
            requestDetailsModal.classList.remove('active');
        }
    });

    // Funções do calendário
    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Atualizar o título do mês
        currentMonthDisplay.textContent = formatMonthYear(currentDate);
        
        calendarEl.innerHTML = '';
        
        // Adicionar cabeçalho dos dias da semana
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const header = document.createElement('div');
        header.className = 'calendar-header';
        weekDays.forEach(day => {
            const span = document.createElement('span');
            span.textContent = day;
            header.appendChild(span);
        });
        calendarEl.appendChild(header);

        // Criar grade do calendário
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        let currentWeek = 1;
        let dayCount = 1;

        // Criar a primeira semana com células vazias se necessário
        let weekDiv = document.createElement('div');
        weekDiv.className = 'calendar-week';
        
        // Adicionar número da semana
        const weekNumber = document.createElement('div');
        weekNumber.className = 'week-number';
        weekNumber.textContent = currentWeek;
        weekDiv.appendChild(weekNumber);

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
                weekDiv = document.createElement('div');
                weekDiv.className = 'calendar-week';
                currentWeek++;
                
                const weekNumber = document.createElement('div');
                weekNumber.className = 'week-number';
                weekNumber.textContent = currentWeek;
                weekDiv.appendChild(weekNumber);
            }

            const date = new Date(year, month, dayCount);
            const dayProducts = getProductsForDate(date);
            
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            if (dayProducts.length > 0) {
                dayEl.classList.add('has-products');
            }
            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                dayEl.classList.add('selected');
            }

            dayEl.innerHTML = `
                <div class="day-number">${dayCount}</div>
                ${dayProducts.length > 0 ? `<div class="product-count">${dayProducts.length} carga${dayProducts.length > 1 ? 's' : ''}</div>` : ''}
            `;

            dayEl.addEventListener('click', () => {
                selectedDate = date;
                updateCalendar();
                updateDayDetails(date);
            });

            weekDiv.appendChild(dayEl);
            dayCount++;
        }

        // Adicionar a última semana
        calendarEl.appendChild(weekDiv);
    }

    function updateDayDetails(date) {
        const dayProducts = getProductsForDate(date);
        const dayProductsEl = document.querySelector('.day-products');
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
            dayProductsEl.appendChild(productEl);

            // Adicionar evento de clique no botão de edição
            const editBtn = productEl.querySelector('.btn-edit');
            editBtn.addEventListener('click', () => openEditDateModal(product));
        });

        // Adicionar total do dia
        const totalEl = document.createElement('div');
        totalEl.className = 'day-product-item total';
        totalEl.innerHTML = `
            <div class="product-details">
                <h5>Total do Dia</h5>
                <p>${formatNumber(totalKg)} kg</p>
            </div>
        `;
        dayProductsEl.appendChild(totalEl);
    }

    function getProductsForDate(date) {
        return products.filter(product => {
            const productDate = new Date(product.deliveryDate);
            return productDate.toDateString() === date.toDateString();
        });
    }

    function openEditDateModal(product) {
        selectedProductId = product.id;
        editSupplierSpan.textContent = product.supplier;
        editAlloySpan.textContent = product.alloy;
        editQuantitySpan.textContent = `${formatNumber(product.quantity)} kg`;
        newDeliveryDateInput.value = product.deliveryDate;
        editDateModal.classList.add('active');
    }

    function closeEditDateModal() {
        editDateModal.classList.remove('active');
        selectedProductId = null;
    }

    function updateDeliveryDate() {
        const newDate = newDeliveryDateInput.value;
        const productIndex = products.findIndex(p => p.id === selectedProductId);
        
        if (productIndex !== -1) {
            products[productIndex].deliveryDate = newDate;
            updateProductsTable();
            updateCalendar();
            
            // Mostrar toast de sucesso
            const toast = document.createElement('div');
            toast.className = 'toast success';
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="bi bi-check-circle"></i>
                    <span>Data de entrega atualizada com sucesso!</span>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        closeEditDateModal();
    }

    // Event listener para o formulário
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Verificar se todos os elementos necessários existem
        const supplier = document.getElementById('supplier');
        const alloy = document.getElementById('alloy');
        const productDescription = document.getElementById('product_description');
        const purchaseType = document.getElementById('purchase_type');
        const quantidade = document.getElementById('quantidade');
        const deliveryDate = document.getElementById('delivery_date');

        if (!supplier || !alloy || !productDescription || !purchaseType || !quantidade || !deliveryDate) {
            console.error('Elementos do formulário não encontrados');
            return;
        }

        const formData = {
            id: nextId++,
            supplier: supplier.value,
            alloy: alloy.value,
            productDescription: productDescription.value,
            purchaseType: purchaseType.value,
            quantity: parseFloat(quantidade.value),
            deliveryDate: deliveryDate.value
        };

        products.push(formData);
        updateProductsTable();
        updateCalendar();

        // Resetar formulário
        this.reset();
        productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
        
        // Mostrar toast de sucesso
        showToast('Carga adicionada com sucesso!', 'success');
    });

    // Event listeners do calendário
    viewCalendarBtn.addEventListener('click', () => {
        calendarModal.classList.add('active');
        updateCalendar();
    });

    closeModal.addEventListener('click', () => {
        calendarModal.classList.remove('active');
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    // Fechar modal ao clicar fora
    calendarModal.addEventListener('click', (e) => {
        if (e.target === calendarModal) {
            calendarModal.classList.remove('active');
        }
    });

    // Event Listeners para o modal de edição
    cancelEditBtn.addEventListener('click', closeEditDateModal);
    confirmEditBtn.addEventListener('click', updateDeliveryDate);

    // Fechar modal ao clicar fora
    editDateModal.addEventListener('click', (e) => {
        if (e.target === editDateModal) {
            closeEditDateModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editDateModal.classList.contains('active')) {
            closeEditDateModal();
        }
    });

    // Event listener para o botão de finalizar
    if (finalizeRequestBtn) {
        finalizeRequestBtn.addEventListener('click', () => {
            if (products.length > 0) {
                if (confirm('Deseja finalizar esta solicitação de compras?')) {
                    createPendingRequest();
                }
            }
        });
    }

    // Atualizar estado inicial do botão
    updateFinalizeButton();

    // Inicialização
    updateCalendar();

    // Event listeners para os novos botões
    const printRequestBtn = document.getElementById('print-request');
    const emailRequestBtn = document.getElementById('email-request');
    
    if (printRequestBtn) {
        printRequestBtn.addEventListener('click', printRequest);
    }
    
    if (emailRequestBtn) {
        emailRequestBtn.addEventListener('click', emailRequest);
    }
});

// Função para formatar o mês e ano
function formatMonthYear(date) {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

// Função para formatar números
function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Função para formatar data
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

// Função para imprimir a solicitação
function printRequest() {
    const requestId = document.getElementById('request-id');
    const requestDate = document.getElementById('request-date');
    const requestStatus = document.getElementById('request-status');
    const itemsTable = document.getElementById('request-items-table');

    if (!requestId || !requestDate || !requestStatus || !itemsTable) {
        console.error('Elementos necessários para impressão não encontrados');
        return;
    }

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Solicitação de Compra #${requestId.textContent}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    color: #1f3b5a;
                    margin-bottom: 20px;
                }
                .info {
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #1f3b5a;
                    color: white;
                }
                .status {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                .status-pendente { background-color: #ffc107; color: #000; }
                .status-aprovado { background-color: #28a745; color: #fff; }
                .status-recusado { background-color: #dc3545; color: #fff; }
                .status-revisao { background-color: #17a2b8; color: #fff; }
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <h1>Solicitação de Compra #${requestId.textContent}</h1>
            <div class="info">
                <p><strong>Data:</strong> ${requestDate.textContent}</p>
                <p><strong>Status:</strong> <span class="status status-${requestStatus.textContent.toLowerCase()}">${requestStatus.textContent}</span></p>
            </div>
            ${itemsTable.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Função para enviar a solicitação por e-mail
function emailRequest() {
    const requestId = document.getElementById('request-id');
    const requestDate = document.getElementById('request-date');
    const requestStatus = document.getElementById('request-status');
    
    if (!requestId || !requestDate || !requestStatus) {
        console.error('Elementos necessários para envio de e-mail não encontrados');
        return;
    }
    
    // Criar o corpo do e-mail com os detalhes da solicitação
    const subject = `Solicitação de Compra #${requestId.textContent}`;
    const body = `Detalhes da Solicitação:\n\n` +
                `ID: ${requestId.textContent}\n` +
                `Data: ${requestDate.textContent}\n` +
                `Status: ${requestStatus.textContent}\n\n` +
                `Para mais detalhes, acesse o sistema.`;
    
    // Abrir o cliente de e-mail padrão
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Mostrar mensagem de sucesso
    showToast('E-mail aberto no seu cliente de e-mail padrão', 'success');
} 