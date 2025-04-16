// Importar o módulo principal
import './js/modules/purchase-request/index.js';

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
    const purchaseTypeSelect = document.getElementById('purchase_type');
    const quantitySelect = document.getElementById('quantidade');
    const deliveryDateInput = document.getElementById('delivery_date');
    
    if (!supplierSelect || !alloySelect || !productDescriptionSelect) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    // Configuração inicial: desabilitar os selects de liga e descrição
    alloySelect.disabled = true;
    productDescriptionSelect.disabled = true;
    
    // Função para atualizar as opções de liga com base no fornecedor selecionado
    function updateAlloyOptions() {
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
    
    // Função para atualizar as descrições de produtos
    function updateProductDescriptions() {
        const supplier = supplierSelect.value;
        const alloy = alloySelect.value;
        
        console.log('Atualizando descrições:', { supplier, alloy });
        
        // Limpar select de descrição
        productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
        
        // Se não tiver fornecedor ou liga selecionados, desabilitar select de descrição
        if (!supplier || !alloy) {
            productDescriptionSelect.disabled = true;
            return;
        }
        
        // Se existirem dados para esta combinação
        if (productData[supplier] && productData[supplier][alloy]) {
            console.log('Dados encontrados:', productData[supplier][alloy]);
            
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
            console.log('Nenhum dado encontrado para esta combinação');
            productDescriptionSelect.disabled = true;
        }
    }

    // Event listeners para atualização das opções de liga e descrições de produtos
    supplierSelect.addEventListener('change', function() {
        console.log('Fornecedor alterado:', this.value);
        updateAlloyOptions();
    });

    alloySelect.addEventListener('change', function() {
        console.log('Liga alterada:', this.value);
        updateProductDescriptions();
        
        // Disparar evento de change no select de descrição para garantir que o formulário registre a seleção automática
        if (productDescriptionSelect.options.length > 0 && productDescriptionSelect.selectedIndex > 0) {
            productDescriptionSelect.dispatchEvent(new Event('change'));
        }
    });

    // Inicializar os selects
    updateAlloyOptions();
    
    // Elementos da tabela
    const productsTable = document.getElementById('products-table');
    const totalProducts = document.getElementById('total-products');
    const totalWeight = document.getElementById('total-weight');
    const tbody = productsTable ? productsTable.querySelector('tbody') : null;
    
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

    // Verificar se os elementos do modal foram encontrados
    console.log('Elementos do modal:', {
        editDateModal: !!editDateModal,
        newDeliveryDateInput: !!newDeliveryDateInput,
        cancelEditBtn: !!cancelEditBtn,
        confirmEditBtn: !!confirmEditBtn,
        editSupplierSpan: !!editSupplierSpan,
        editAlloySpan: !!editAlloySpan,
        editQuantitySpan: !!editQuantitySpan
    });

    // Elementos do botão de finalizar
    const finalizeRequestBtn = document.getElementById('finalize-request');
    const pendingRequestsTableElement = document.getElementById('pending-requests-table');
    const pendingRequestsTable = pendingRequestsTableElement ? pendingRequestsTableElement.querySelector('tbody') : null;
    let pendingRequests = [];
    let nextPendingId = 1;

    // Carregar dados do localStorage ao iniciar
    function loadFromLocalStorage() {
        try {
            // Carregar produtos
            const savedProducts = localStorage.getItem('purchaseRequestProducts');
            if (savedProducts) {
                products = JSON.parse(savedProducts);
                // Garantir que o próximo ID seja maior que o último produto
                if (products.length > 0) {
                    const maxId = Math.max(...products.map(p => p.id));
                    nextId = maxId + 1;
                }
                updateProductsTable();
            }

            // Carregar solicitações pendentes
            const savedPendingRequests = localStorage.getItem('pendingRequests');
            if (savedPendingRequests) {
                pendingRequests = JSON.parse(savedPendingRequests);
                // Garantir que o próximo ID de solicitação pendente seja maior que o último
                if (pendingRequests.length > 0) {
                    const maxId = Math.max(...pendingRequests.map(p => p.id));
                    nextPendingId = maxId + 1;
                }
                updatePendingRequestsTable();
            }

            // Carregar valores do formulário
            const formData = localStorage.getItem('purchaseRequestForm');
            if (formData) {
                const data = JSON.parse(formData);
                if (data.supplier) {
                    supplierSelect.value = data.supplier;
                    updateAlloyOptions();
                    
                    if (data.alloy) {
                        alloySelect.value = data.alloy;
                        updateProductDescriptions();
                        
                        if (data.productDescription) {
                            productDescriptionSelect.value = data.productDescription;
                        }
                    }
                }
                
                if (data.purchaseType) {
                    purchaseTypeSelect.value = data.purchaseType;
                }
                
                if (data.quantity) {
                    quantitySelect.value = data.quantity;
                }
                
                if (data.deliveryDate) {
                    deliveryDateInput.value = data.deliveryDate;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage:', error);
        }
    }

    // Salvar dados no localStorage
    function saveToLocalStorage() {
        try {
            // Salvar produtos
            localStorage.setItem('purchaseRequestProducts', JSON.stringify(products));
            
            // Salvar solicitações pendentes
            localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
            
            // Salvar valores do formulário
            const formData = {
                supplier: supplierSelect.value,
                alloy: alloySelect.value,
                productDescription: productDescriptionSelect.value,
                purchaseType: purchaseTypeSelect ? purchaseTypeSelect.value : '',
                quantity: quantitySelect ? quantitySelect.value : '',
                deliveryDate: deliveryDateInput ? deliveryDateInput.value : ''
            };
            localStorage.setItem('purchaseRequestForm', JSON.stringify(formData));
        } catch (error) {
            console.error('Erro ao salvar dados no localStorage:', error);
        }
    }

    // Limpar dados do localStorage após finalizar a solicitação
    function clearLocalStorage() {
        localStorage.removeItem('purchaseRequestProducts');
        localStorage.removeItem('purchaseRequestForm');
        // Não remover pendingRequests, pois precisamos manter
    }

    // Atualizar localStorage quando houver mudanças no formulário
    function attachFormListeners() {
        const formElements = [
            supplierSelect, 
            alloySelect, 
            productDescriptionSelect, 
            purchaseTypeSelect, 
            quantitySelect, 
            deliveryDateInput
        ];

        formElements.forEach(element => {
            if (element) {
                element.addEventListener('change', saveToLocalStorage);
            }
        });
    }

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
        
        // Salvar produtos no localStorage após atualizar a tabela
        saveToLocalStorage();
    }

    // Elementos do calendário
    const calendarModal = document.getElementById('calendar-modal');
    const viewCalendarBtn = document.getElementById('view-calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const calendarEl = document.getElementById('calendar');
    const dayDetailsEl = document.getElementById('day-details');

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

    // Verificar se os elementos do modal de detalhes existem
    console.log('Elementos do modal de detalhes:', {
        requestDetailsModal: !!requestDetailsModal,
        requestIdSpan: !!requestIdSpan,
        requestDateSpan: !!requestDateSpan,
        requestStatusSpan: !!requestStatusSpan,
        requestItemsTable: !!requestItemsTable,
        approveBtn: !!approveBtn,
        reviewBtn: !!reviewBtn,
        rejectBtn: !!rejectBtn,
        submitReviewBtn: !!submitReviewBtn,
        cancelReviewBtn: !!cancelReviewBtn
    });

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
        
        // Salvar no localStorage após atualizar a tabela
        saveToLocalStorage();
    }

    // Função para visualizar detalhes da solicitação
    function viewRequestDetails(id) {
        currentRequestId = id;
        const request = pendingRequests.find(r => r.id === id);
        
        if (!request) {
            console.error('Solicitação não encontrada:', id);
            return;
        }
        
        // Verificar se os elementos do modal existem
        if (!requestIdSpan || !requestDateSpan || !requestStatusSpan || !requestItemsTable) {
            console.error('Elementos do modal não encontrados');
            return;
        }
        
        // Preencher os detalhes da solicitação
        requestIdSpan.textContent = request.id;
        requestDateSpan.textContent = new Intl.DateTimeFormat('pt-BR').format(new Date(request.date));
        requestStatusSpan.textContent = request.status;
        requestStatusSpan.className = `status-badge status-${request.status.toLowerCase().replace(/\s+/g, '')}`;
        
        // Preencher a tabela de itens
        requestItemsTable.innerHTML = '';
        let totalWeight = 0;
        
        // Verificar se os itens estão em 'items' ou 'products'
        const items = request.items || request.products || [];
        
        items.forEach(item => {
            totalWeight += parseFloat(item.quantity);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.supplier}</td>
                <td>${item.alloy}</td>
                <td>${item.productDescription}</td>
                <td>${item.purchaseType}</td>
                <td>${formatNumber(item.quantity)} kg</td>
                <td>${formatDate(item.deliveryDate)}</td>
            `;
            requestItemsTable.appendChild(row);
        });
        
        // Adicionar linha de total
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td colspan="4" class="text-right"><strong>Total:</strong></td>
            <td><strong>${formatNumber(totalWeight)} kg</strong></td>
            <td></td>
        `;
        requestItemsTable.appendChild(totalRow);
        
        // Configurar botões com base no status
        if (approveBtn) approveBtn.style.display = request.status === 'Pendente' ? 'inline-block' : 'none';
        if (reviewBtn) reviewBtn.style.display = request.status === 'Pendente' ? 'inline-block' : 'none';
        if (rejectBtn) rejectBtn.style.display = request.status === 'Pendente' ? 'inline-block' : 'none';
        
        // Esconder o formulário de revisão
        if (reviewForm) reviewForm.style.display = 'none';
        
        // Exibir os botões de ação
        const actionsDiv = document.querySelector('.request-actions');
        if (actionsDiv) actionsDiv.style.display = 'flex';
        
        // Exibir o modal
        requestDetailsModal.classList.add('active');
    }

    // Função para criar uma solicitação pendente
    function createPendingRequest() {
        if (products.length === 0) {
            showToast('Adicione pelo menos um produto à solicitação.', 'error');
            return;
        }

        const purchaseType = products.some(p => p.purchaseType === 'Vendas') ? 'Vendas' : 'Transformação';
        
        const totalWeight = products.reduce((sum, product) => sum + product.quantity, 0);
        
        const request = {
            id: nextPendingId++,
            date: new Date(),
            totalProducts: products.length,
            totalWeight: totalWeight,
            purchaseType: purchaseType,
            status: 'Pendente',
            products: [...products] // Cópia dos produtos
        };
        
        pendingRequests.push(request);
        updatePendingRequestsTable();
        
        // Limpar a tabela de produtos atual
        products = [];
        updateProductsTable();
        
        showToast('Solicitação finalizada com sucesso!');
        
        // Após finalizar a solicitação, limpar o localStorage
        clearLocalStorage();
    }

    // Funções de ação nas solicitações
    function approveRequest() {
        const request = pendingRequests.find(r => r.id === currentRequestId);
        if (!request) return;

        request.status = 'Aprovado';
        if (!request.history) {
            request.history = [];
        }
        
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

        // Atualizar o status da solicitação
        request.status = 'Em Revisão';
        request.history.push({
            date: new Date().toISOString(),
            action: 'Revisão Solicitada',
            notes: notes
        });

        // Atualizar a tabela de solicitações pendentes
        updatePendingRequestsTable();
        requestDetailsModal.classList.remove('active');
        
        // Enviar e-mail para o responsável pela revisão
        sendReviewEmail(request, notes);
        
        showToast('Solicitação enviada para revisão e e-mail enviado ao responsável.', 'info');
    }

    // Função para enviar e-mail para o responsável pela revisão
    function sendReviewEmail(request, notes) {
        // Configurações do e-mail
        const reviewerEmail = "revisor@tecnoperfil.com.br"; // E-mail do responsável pela revisão
        const subject = `Solicitação de Revisão #${request.id} - ${new Intl.DateTimeFormat('pt-BR').format(new Date(request.date))}`;
        
        // Obter os itens da solicitação
        const items = request.items || request.products || [];
        
        // Criar o corpo do e-mail com HTML para formatação profissional
        let emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: #1f3b5a;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9f5ff;
            border: 1px solid #ddd;
            border-top: none;
        }
        .info-box {
            background-color: #e9f5ff;
            border: 1px solid #c5e2ff;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #1f3b5a;
            color: white;
            text-align: left;
            padding: 10px;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .notes-box {
            background-color: #fff6e6;
            border: 1px solid #ffe0b2;
            border-radius: 5px;
            padding: 15px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            background-color: #ffc107;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Solicitação de Revisão de Compra</h2>
        </div>
        <div class="content">
            <div class="info-box">
                <div class="info-item"><strong>ID da Solicitação:</strong> #${request.id}</div>
                <div class="info-item"><strong>Data:</strong> ${new Intl.DateTimeFormat('pt-BR').format(new Date(request.date))}</div>
                <div class="info-item"><strong>Status:</strong> <span class="status">${request.status}</span></div>
            </div>
            
            <h3>Itens da Solicitação</h3>
            <table>
                <thead>
                    <tr>
                        <th>Fornecedor</th>
                        <th>Liga</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Entrega</th>
                    </tr>
                </thead>
                <tbody>
`;

        // Adicionar os itens à tabela
        let totalWeight = 0;
        
        if (items.length > 0) {
            items.forEach(item => {
                totalWeight += parseFloat(item.quantity);
                emailBody += `
                    <tr>
                        <td>${item.supplier}</td>
                        <td>${item.alloy}</td>
                        <td>${item.productDescription}</td>
                        <td>${item.purchaseType}</td>
                        <td>${formatNumber(item.quantity)} kg</td>
                        <td>${formatDate(item.deliveryDate)}</td>
                    </tr>
                `;
            });
            
            // Adicionar linha de total
            emailBody += `
                <tr style="font-weight: bold; background-color: #e9f5ff;">
                    <td colspan="4" style="text-align: right;">Total:</td>
                    <td>${formatNumber(totalWeight)} kg</td>
                    <td></td>
                </tr>
            `;
        } else {
            emailBody += `
                <tr>
                    <td colspan="6" style="text-align: center;">Nenhum item encontrado na solicitação</td>
                </tr>
            `;
        }
        
        // Finalizar o corpo do e-mail
        emailBody += `
                </tbody>
            </table>
            
            <div class="notes-box">
                <h3>Observações para Revisão</h3>
                <p>${notes.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Por favor, acesse o sistema para revisar esta solicitação.</p>
            
            <div class="footer">
                <p>Este e-mail foi enviado automaticamente pelo Sistema de Gestão LME.</p>
                <p>TECNOPERFIL ALUMINIO LTDA - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
        
        // Versão em texto simples para clientes de e-mail que não suportam HTML
        let plainTextBody = `Prezado Revisor,\n\n`;
        plainTextBody += `Uma solicitação de compra requer sua revisão:\n\n`;
        plainTextBody += `ID da Solicitação: ${request.id}\n`;
        plainTextBody += `Data: ${new Intl.DateTimeFormat('pt-BR').format(new Date(request.date))}\n`;
        plainTextBody += `Status: ${request.status}\n\n`;
        
        plainTextBody += `ITENS DA SOLICITAÇÃO:\n`;
        if (items.length > 0) {
            items.forEach((item, index) => {
                plainTextBody += `\n${index + 1}. ${item.supplier} - ${item.alloy}\n`;
                plainTextBody += `   Descrição: ${item.productDescription}\n`;
                plainTextBody += `   Quantidade: ${formatNumber(item.quantity)} kg\n`;
                plainTextBody += `   Tipo: ${item.purchaseType}\n`;
                plainTextBody += `   Previsão de Entrega: ${formatDate(item.deliveryDate)}\n`;
            });
            plainTextBody += `\nTotal: ${formatNumber(totalWeight)} kg\n`;
        } else {
            plainTextBody += `\nNenhum item encontrado na solicitação.\n`;
        }
        
        plainTextBody += `\n\nOBSERVAÇÕES PARA REVISÃO:\n${notes}\n\n`;
        plainTextBody += `Por favor, acesse o sistema para revisar esta solicitação.\n\n`;
        plainTextBody += `Atenciosamente,\nSistema de Gestão LME`;
        
        // Usar a API de e-mail do navegador para abrir o cliente de e-mail padrão
        // Tentar enviar versão HTML, com fallback para texto simples
        const mailtoLink = `mailto:${reviewerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}&html=${encodeURIComponent(emailBody)}`;
        
        // Abrir o cliente de e-mail padrão
        window.open(mailtoLink, '_blank');
        
        console.log('E-mail de revisão preparado para:', reviewerEmail);
    }

    // Função para mostrar toasts
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
        
        // Adicionar um elemento vazio para alinhar com o número da semana
        const emptySpan = document.createElement('span');
        header.appendChild(emptySpan);
        
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
            // Corrigindo o problema de fuso horário
            const productDateStr = product.deliveryDate;
            // Criar a data sem considerar o fuso horário (apenas ano, mês e dia)
            const [year, month, day] = productDateStr.split('-').map(Number);
            const productDate = new Date(year, month - 1, day);
            
            // Comparar apenas ano, mês e dia
            return productDate.getFullYear() === date.getFullYear() &&
                   productDate.getMonth() === date.getMonth() &&
                   productDate.getDate() === date.getDate();
        });
    }

    // Função para abrir o modal de edição de data
    function openEditDateModal(product) {
        selectedProductId = product.id;
        
        // Verificar se os elementos do modal existem
        if (!editDateModal || !editSupplierSpan || !editAlloySpan || !editQuantitySpan || !newDeliveryDateInput) {
            console.error('Elementos do modal não encontrados');
            return;
        }
        
        // Preencher os dados do produto no modal
        editSupplierSpan.textContent = product.supplier;
        editAlloySpan.textContent = product.alloy;
        editQuantitySpan.textContent = `${formatNumber(product.quantity)} kg`;
        
        // Garantir que a data seja exibida corretamente no campo de edição
        newDeliveryDateInput.value = product.deliveryDate;
        
        // Abrir o modal
        editDateModal.classList.add('active');
        
        console.log('Modal aberto para o produto:', product);
    }

    // Função para fechar o modal de edição de data
    function closeEditDateModal() {
        if (!editDateModal) {
            console.error('Modal de edição de data não encontrado');
            return;
        }
        
        editDateModal.classList.remove('active');
        selectedProductId = null;
        
        console.log('Modal fechado');
    }

    // Função para atualizar a data de entrega
    function updateDeliveryDate() {
        if (!newDeliveryDateInput) {
            console.error('Campo de nova data não encontrado');
            return;
        }
        
        const newDate = newDeliveryDateInput.value;
        
        if (!newDate) {
            console.error('Nova data não informada');
            return;
        }
        
        const productIndex = products.findIndex(p => p.id === selectedProductId);
        
        if (productIndex === -1) {
            console.error('Produto não encontrado');
            return;
        }
        
        // Atualizar a data de entrega mantendo o formato original
        products[productIndex].deliveryDate = newDate;
        
        // Atualizar a tabela e o calendário
        updateProductsTable();
        updateCalendar();
        
        if (selectedDate) {
            // Atualizar detalhes do dia selecionado
            updateDayDetails(selectedDate);
        }
        
        // Mostrar toast de sucesso
        showToast('Data de entrega atualizada com sucesso!', 'success');
        
        // Fechar o modal
        closeEditDateModal();
        
        console.log('Data atualizada com sucesso:', newDate);
    }

    // Função auxiliar para configurar os event listeners
    function setupEditDateModalListeners() {
        console.log('Configurando event listeners para o modal de edição de data');
        
        // Botão de confirmação
        if (confirmEditBtn) {
            // Remover event listeners existentes para evitar duplicação
            confirmEditBtn.removeEventListener('click', updateDeliveryDate);
            // Adicionar novo event listener
            confirmEditBtn.addEventListener('click', updateDeliveryDate);
            console.log('Event listener adicionado ao botão de confirmação');
        } else {
            console.error('Botão de confirmação não encontrado');
        }
        
        // Botão de cancelamento
        if (cancelEditBtn) {
            // Remover event listeners existentes para evitar duplicação
            cancelEditBtn.removeEventListener('click', closeEditDateModal);
            // Adicionar novo event listener
            cancelEditBtn.addEventListener('click', closeEditDateModal);
            console.log('Event listener adicionado ao botão de cancelamento');
        } else {
            console.error('Botão de cancelamento não encontrado');
        }
        
        // Botão de fechar no cabeçalho do modal
        const closeEditModalBtn = editDateModal ? editDateModal.querySelector('.close-modal') : null;
        if (closeEditModalBtn) {
            // Remover event listeners existentes para evitar duplicação
            closeEditModalBtn.removeEventListener('click', closeEditDateModal);
            // Adicionar novo event listener
            closeEditModalBtn.addEventListener('click', closeEditDateModal);
            console.log('Event listener adicionado ao botão de fechar');
        } else {
            console.error('Botão de fechar não encontrado');
        }
        
        // Fechar modal ao clicar fora
        if (editDateModal) {
            // Função para lidar com clique fora do modal
            function handleModalOutsideClick(e) {
                if (e.target === editDateModal) {
                    closeEditDateModal();
                }
            }
            
            // Remover event listeners existentes para evitar duplicação
            editDateModal.removeEventListener('click', handleModalOutsideClick);
            // Adicionar novo event listener
            editDateModal.addEventListener('click', handleModalOutsideClick);
            console.log('Event listener adicionado para fechar o modal ao clicar fora');
        } else {
            console.error('Modal de edição de data não encontrado');
        }
        
        // Fechar modal com ESC
        function handleEscapeKey(e) {
            if (e.key === 'Escape' && editDateModal && editDateModal.classList.contains('active')) {
                closeEditDateModal();
            }
        }
        
        // Remover event listener existente
        document.removeEventListener('keydown', handleEscapeKey);
        // Adicionar novo event listener
        document.addEventListener('keydown', handleEscapeKey);
        console.log('Event listener adicionado para fechar o modal com ESC');
    }

    // Chamar a função para configurar os event listeners
    setupEditDateModalListeners();

    // Enviar formulário de solicitação
    purchaseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const supplier = supplierSelect.value;
        const alloy = alloySelect.value;
        const productDescription = productDescriptionSelect.value;
        const purchaseType = document.getElementById('purchase_type').value;
        const quantity = parseInt(document.getElementById('quantidade').value);
        const deliveryDate = document.getElementById('delivery_date').value;
        
        if (!supplier || !alloy || !productDescription || !purchaseType || !quantity || !deliveryDate) {
            showToast('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        const newProduct = {
            id: nextId++,
            supplier,
            alloy,
            productDescription,
            purchaseType,
            quantity,
            deliveryDate
        };
        
        products.push(newProduct);
        updateProductsTable();
        updateCalendar();
        
        // Resetar o formulário, mas manter o fornecedor e liga selecionados
        const currentSupplier = supplierSelect.value;
        const currentAlloy = alloySelect.value;
        
        // Limpar apenas os campos específicos
        document.getElementById('purchase_type').value = '';
        document.getElementById('quantidade').value = '';
        document.getElementById('delivery_date').value = '';
        
        // Manter fornecedor e liga selecionados
        supplierSelect.value = currentSupplier;
        alloySelect.value = currentAlloy;
        updateProductDescriptions();
        
        // Salvar estado atual no localStorage com o formulário parcialmente resetado
        saveToLocalStorage();
        
        showToast('Produto adicionado com sucesso!', 'success');
    });

    // Event listeners do calendário
    if (viewCalendarBtn) {
        viewCalendarBtn.addEventListener('click', function() {
            if (calendarModal) {
                calendarModal.style.display = 'flex';
                updateCalendar();
            }
        });
    }
    
    if (finalizeRequestBtn) {
        finalizeRequestBtn.addEventListener('click', function() {
            createPendingRequest();
        });
    }

    // Corrigindo o seletor do botão de fechar
    const closeModalBtn = calendarModal.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            calendarModal.style.display = 'none';
        });
    }

    // Fechar modal do calendário ao clicar fora
    if (calendarModal) {
        calendarModal.addEventListener('click', function(e) {
            if (e.target === calendarModal) {
                calendarModal.style.display = 'none';
            }
        });
    }

    // Fechar modal do calendário com a tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && calendarModal && calendarModal.style.display === 'flex') {
            calendarModal.style.display = 'none';
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

    // Adicionar ao escopo global para o botão remover funcionar
    window.removeProduct = function(id) {
        products = products.filter(product => product.id !== id);
        updateProductsTable();
        // Após remover, salvar no localStorage
        saveToLocalStorage();
    };

    // Inicializar - carregar dados do localStorage
    loadFromLocalStorage();
    
    // Adicionar listeners aos campos do formulário
    attachFormListeners();

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
        const itemsTable = document.getElementById('request-items-table');
        
        if (!requestId || !requestDate || !requestStatus || !itemsTable) {
            console.error('Elementos necessários para envio de e-mail não encontrados');
            showToast('Não foi possível gerar o e-mail. Elementos necessários não encontrados.', 'error');
            return;
        }
        
        // Obter os itens da tabela
        const rows = itemsTable.querySelectorAll('tbody tr');
        const items = [];
        let totalWeight = 0;
        
        // Extrair dados da tabela (excluindo a linha de total)
        rows.forEach(row => {
            if (!row.classList.contains('total-row')) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 6) {
                    const item = {
                        supplier: cells[0].textContent.trim(),
                        alloy: cells[1].textContent.trim(),
                        productDescription: cells[2].textContent.trim(),
                        purchaseType: cells[3].textContent.trim(),
                        quantity: cells[4].textContent.trim(),
                        deliveryDate: cells[5].textContent.trim()
                    };
                    
                    // Extrair o valor numérico da quantidade (removendo "kg" e formatação)
                    const quantityMatch = item.quantity.match(/([0-9.,]+)/);
                    if (quantityMatch) {
                        const quantityValue = parseFloat(quantityMatch[1].replace(/\./g, '').replace(',', '.'));
                        totalWeight += quantityValue;
                    }
                    
                    items.push(item);
                }
            }
        });
        
        // Formatar o total
        const formattedTotal = formatNumber(totalWeight);
        
        // Criar o assunto do e-mail
        const subject = `Solicitação de Compra #${requestId.textContent}`;
        
        // Criar o corpo do e-mail com HTML para formatação profissional
        let emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: #1f3b5a;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #f9f5ff;
            border: 1px solid #ddd;
            border-top: none;
        }
        .info-box {
            background-color: #e9f5ff;
            border: 1px solid #c5e2ff;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #1f3b5a;
            color: white;
            text-align: left;
            padding: 10px;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
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
        .status-emrevisão { background-color: #17a2b8; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Solicitação de Compra</h2>
        </div>
        <div class="content">
            <div class="info-box">
                <div class="info-item"><strong>ID da Solicitação:</strong> #${requestId.textContent}</div>
                <div class="info-item"><strong>Data:</strong> ${requestDate.textContent}</div>
                <div class="info-item"><strong>Status:</strong> <span class="status status-${requestStatus.textContent.toLowerCase().replace(/\s+/g, '')}">${requestStatus.textContent}</span></div>
            </div>
            
            <h3>Itens da Solicitação</h3>
            <table>
                <thead>
                    <tr>
                        <th>Fornecedor</th>
                        <th>Liga</th>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Entrega</th>
                    </tr>
                </thead>
                <tbody>
`;

        // Adicionar os itens à tabela
        if (items.length > 0) {
            items.forEach(item => {
                emailBody += `
                    <tr>
                        <td>${item.supplier}</td>
                        <td>${item.alloy}</td>
                        <td>${item.productDescription}</td>
                        <td>${item.purchaseType}</td>
                        <td>${item.quantity}</td>
                        <td>${item.deliveryDate}</td>
                    </tr>
                `;
            });
            
            // Adicionar linha de total
            emailBody += `
                <tr style="font-weight: bold; background-color: #e9f5ff;">
                    <td colspan="4" style="text-align: right;">Total:</td>
                    <td>${formattedTotal} kg</td>
                    <td></td>
                </tr>
            `;
        } else {
            emailBody += `
                <tr>
                    <td colspan="6" style="text-align: center;">Nenhum item encontrado na solicitação</td>
                </tr>
            `;
        }
        
        // Finalizar o corpo do e-mail
        emailBody += `
                </tbody>
            </table>
            
            <p>Para mais detalhes, acesse o sistema.</p>
            
            <div class="footer">
                <p>Este e-mail foi enviado automaticamente pelo Sistema de Gestão LME.</p>
                <p>TECNOPERFIL ALUMINIO LTDA - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
        
        // Versão em texto simples para clientes de e-mail que não suportam HTML
        let plainTextBody = `Detalhes da Solicitação:\n\n`;
        plainTextBody += `ID: ${requestId.textContent}\n`;
        plainTextBody += `Data: ${requestDate.textContent}\n`;
        plainTextBody += `Status: ${requestStatus.textContent}\n\n`;
        
        plainTextBody += `ITENS DA SOLICITAÇÃO:\n`;
        if (items.length > 0) {
            items.forEach((item, index) => {
                plainTextBody += `\n${index + 1}. ${item.supplier} - ${item.alloy}\n`;
                plainTextBody += `   Descrição: ${item.productDescription}\n`;
                plainTextBody += `   Quantidade: ${item.quantity}\n`;
                plainTextBody += `   Tipo: ${item.purchaseType}\n`;
                plainTextBody += `   Previsão de Entrega: ${item.deliveryDate}\n`;
            });
            plainTextBody += `\nTotal: ${formattedTotal} kg\n`;
        } else {
            plainTextBody += `\nNenhum item encontrado na solicitação.\n`;
        }
        
        plainTextBody += `\nPara mais detalhes, acesse o sistema.`;
        
        try {
            // Usar a API de e-mail do navegador para abrir o cliente de e-mail padrão
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
            
            // Abrir o cliente de e-mail padrão
            window.open(mailtoLink, '_blank');
            
            // Mostrar mensagem de sucesso
            showToast('E-mail aberto no seu cliente de e-mail padrão', 'success');
            console.log('E-mail gerado com sucesso');
        } catch (error) {
            console.error('Erro ao abrir o cliente de e-mail:', error);
            showToast('Erro ao abrir o cliente de e-mail. Verifique o console para mais detalhes.', 'error');
        }
    }
    
    // Função para imprimir a tabela de solicitações
    function printRequestsTable() {
        const table = document.getElementById('pending-requests-table');
        if (!table) {
            console.error('Tabela de solicitações não encontrada');
            return;
        }

        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Solicitações de Compra - TECNOPERFIL ALUMINIO LTDA</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    h1 {
                        color: #1f3b5a;
                        margin-bottom: 10px;
                    }
                    .header-info {
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
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    .status-pendente { background-color: #ffc107; color: #000; }
                    .status-aprovado { background-color: #28a745; color: #fff; }
                    .status-recusado { background-color: #dc3545; color: #fff; }
                    .status-emrevisão { background-color: #17a2b8; color: #fff; }
                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        text-align: center;
                        color: #666;
                    }
                    @media print {
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <h1>Solicitações de Compra</h1>
                <div class="header-info">
                    <p><strong>TECNOPERFIL ALUMINIO LTDA</strong></p>
                    <p><strong>Data de Impressão:</strong> ${new Intl.DateTimeFormat('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(new Date())}</p>
                </div>
                <table>
                    ${table.outerHTML}
                </table>
                <div class="footer">
                    <p>Sistema de Gestão LME - Documento gerado em ${new Date().toISOString()}</p>
                </div>
            </body>
            </html>
        `);
        
        // Remover a coluna de ações da tabela impressa
        const actionCells = printWindow.document.querySelectorAll('table tr th:last-child, table tr td:last-child');
        actionCells.forEach(cell => cell.remove());
        
        printWindow.document.close();
        printWindow.focus();
        
        // Atraso para garantir que os estilos sejam aplicados
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
        
        showToast('Preparando impressão da tabela...', 'info');
    }

    // Função para atualizar a tabela de solicitações
    function refreshRequestsTable() {
        updatePendingRequestsTable();
        showToast('Tabela de solicitações atualizada!', 'success');
    }

    // Função para configurar o contador de caracteres do textarea de observações
    function setupTextareaCharCounter() {
        const textarea = document.getElementById('review-notes');
        const charCount = document.getElementById('char-count');
        const maxLength = 500;
        
        if (!textarea || !charCount) {
            console.error('Elementos do contador de caracteres não encontrados');
            return;
        }
        
        // Definir o atributo maxlength no textarea
        textarea.setAttribute('maxlength', maxLength);
        
        // Função para atualizar o contador de caracteres
        function updateCharCount() {
            const currentLength = textarea.value.length;
            charCount.textContent = currentLength;
            
            // Adicionar classe de alerta quando estiver próximo do limite
            const charCounter = charCount.parentElement;
            if (currentLength >= maxLength - 50) {
                charCounter.classList.add('limit-reached');
            } else {
                charCounter.classList.remove('limit-reached');
            }
        }
        
        // Adicionar event listeners para atualizar o contador
        textarea.addEventListener('input', updateCharCount);
        textarea.addEventListener('keyup', updateCharCount);
        textarea.addEventListener('paste', function() {
            // Usar setTimeout para garantir que o conteúdo colado seja contado
            setTimeout(updateCharCount, 10);
        });
        
        console.log('Contador de caracteres configurado para o textarea de observações');
    }
    
    // Chamar a função para configurar o contador de caracteres
    setupTextareaCharCounter();
    
    // Configurar event listeners para os botões de impressão e atualização da tabela
    const printTableBtn = document.getElementById('print-table');
    const refreshTableBtn = document.getElementById('refresh-table');
    
    if (printTableBtn) {
        printTableBtn.addEventListener('click', printRequestsTable);
        console.log('Event listener adicionado ao botão de impressão da tabela');
    } else {
        console.error('Botão de impressão da tabela não encontrado');
    }
    
    if (refreshTableBtn) {
        refreshTableBtn.addEventListener('click', refreshRequestsTable);
        console.log('Event listener adicionado ao botão de atualização da tabela');
    } else {
        console.error('Botão de atualização da tabela não encontrado');
    }
    
    // Adicionar viewRequestDetails ao escopo global para os botões de detalhes funcionarem
    window.viewRequestDetails = viewRequestDetails;
});