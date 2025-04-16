import { supabaseHelpers } from '../../config/supabase.js';

// Dados dos produtos por fornecedor
const productData = {
    CBA: {
        '6060': [
            'FT 6060 HO 152,4x5900',
            'FT 6060 HO 177,8x5900',
            'FT 6060 HO 203,2x5900'
        ],
        '6063': [
            'FT 6063 HO 152,4x5900',
            'FT 6063 HO 177,8x5900',
            'FT 6063 HO 203,2x5900'
        ]
    },
    ALCOA: {
        '6060': [
            'FT 6060 HO 177,8x5900'
        ],
        '6063': [
            'FT 6063 HO 177,8x5900'
        ]
    }
};

// Função para atualizar a lista de produtos com base no fornecedor e liga selecionados
function updateProductList(supplier, alloy, itemCount = null) {
    console.log('Atualizando descrições:', { supplier, alloy, itemCount });
    console.log('productData disponível:', productData);

    const products = productData[supplier]?.[alloy] || [];
    console.log('Dados encontrados:', products);

    // Determinar o ID do select baseado no itemCount
    const selectId = itemCount ? `product-description-${itemCount}` : 'product-description';
    const productSelect = document.getElementById(selectId);
    
    if (!productSelect) {
        console.error(`Elemento select de produtos não encontrado (ID: ${selectId})`);
        return;
    }

    // Limpar opções existentes
    productSelect.innerHTML = '';

    // Adicionar opção padrão
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um produto';
    productSelect.appendChild(defaultOption);

    // Adicionar produtos disponíveis
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('purchase-request-form');
    const supplierSelect = document.getElementById('supplier');
    const alloySelect = document.getElementById('alloy');
    const itemsContainer = document.getElementById('items-container');
    const addItemButton = document.getElementById('add-item-button');

    if (!form || !supplierSelect || !alloySelect || !itemsContainer || !addItemButton) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    // Atualizar produtos quando fornecedor ou liga mudar
    supplierSelect.addEventListener('change', () => {
        const supplier = supplierSelect.value;
        const alloy = alloySelect.value;
        if (supplier && alloy) {
            updateProductList(supplier, alloy);
        }
    });

    alloySelect.addEventListener('change', () => {
        const supplier = supplierSelect.value;
        const alloy = alloySelect.value;
        if (supplier && alloy) {
            updateProductList(supplier, alloy);
        }
    });

    // Adicionar novo item
    let itemCount = 0;
    addItemButton.addEventListener('click', () => {
        itemCount++;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'purchase-item';
        itemDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="supplier-${itemCount}">Fornecedor</label>
                    <select id="supplier-${itemCount}" name="items[${itemCount}][supplier]" required>
                        <option value="">Selecione um fornecedor</option>
                        <option value="CBA">CBA</option>
                        <option value="ALCOA">ALCOA</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="alloy-${itemCount}">Liga</label>
                    <select id="alloy-${itemCount}" name="items[${itemCount}][alloy]" required>
                        <option value="">Selecione uma liga</option>
                        <option value="6060">6060</option>
                        <option value="6063">6063</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="product-description-${itemCount}">Descrição do Produto</label>
                    <select id="product-description-${itemCount}" name="items[${itemCount}][product_description]" required>
                        <option value="">Selecione um produto</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="purchase-type-${itemCount}">Tipo de Compra</label>
                    <select id="purchase-type-${itemCount}" name="items[${itemCount}][purchase_type]" required>
                        <option value="">Selecione o tipo</option>
                        <option value="spot">Spot</option>
                        <option value="programada">Programada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantity-${itemCount}">Quantidade (kg)</label>
                    <input type="number" id="quantity-${itemCount}" name="items[${itemCount}][quantity]" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="delivery-date-${itemCount}">Data de Entrega</label>
                    <input type="date" id="delivery-date-${itemCount}" name="items[${itemCount}][delivery_date]" required>
                </div>
                <button type="button" class="remove-item-button">Remover</button>
            </div>
        `;

        itemsContainer.appendChild(itemDiv);

        // Adicionar event listeners para o novo item
        const newSupplierSelect = document.getElementById(`supplier-${itemCount}`);
        const newAlloySelect = document.getElementById(`alloy-${itemCount}`);
        
        newSupplierSelect.addEventListener('change', () => {
            const supplier = newSupplierSelect.value;
            const alloy = newAlloySelect.value;
            if (supplier && alloy) {
                updateProductList(supplier, alloy, itemCount);
            }
        });

        newAlloySelect.addEventListener('change', () => {
            const supplier = newSupplierSelect.value;
            const alloy = newAlloySelect.value;
            if (supplier && alloy) {
                updateProductList(supplier, alloy, itemCount);
            }
        });

        // Adicionar event listener para remover item
        const removeButton = itemDiv.querySelector('.remove-item-button');
        removeButton.addEventListener('click', () => {
            itemDiv.remove();
            updateTotals();
        });
    });

    // Enviar formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);
            const requestData = {
                client_name: formData.get('client_name'),
                total_weight: parseFloat(formData.get('total_weight')),
                total_loads: parseInt(formData.get('total_loads')),
                items: []
            };

            // Coletar dados dos itens
            const items = itemsContainer.querySelectorAll('.purchase-item');
            items.forEach((item, index) => {
                requestData.items.push({
                    supplier: formData.get(`items[${index}][supplier]`),
                    alloy: formData.get(`items[${index}][alloy]`),
                    product_description: formData.get(`items[${index}][product_description]`),
                    purchase_type: formData.get(`items[${index}][purchase_type]`),
                    quantity: parseFloat(formData.get(`items[${index}][quantity]`)),
                    delivery_date: formData.get(`items[${index}][delivery_date]`)
                });
            });

            // Enviar para o Supabase
            const result = await supabaseHelpers.purchaseRequests.create(requestData);
            
            alert('Solicitação de compra criada com sucesso!');
            form.reset();
            itemsContainer.innerHTML = '';
            itemCount = 0;
            
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            alert('Erro ao criar solicitação. Por favor, tente novamente.');
        }
    });

    // Atualizar totais quando houver mudança nos itens
    function updateTotals() {
        let totalWeight = 0;
        const items = itemsContainer.querySelectorAll('.purchase-item');
        
        items.forEach(item => {
            const quantityInput = item.querySelector('input[type="number"]');
            if (quantityInput && quantityInput.value) {
                totalWeight += parseFloat(quantityInput.value);
            }
        });

        const totalWeightInput = document.getElementById('total-weight');
        const totalLoadsInput = document.getElementById('total-loads');
        
        if (totalWeightInput) {
            totalWeightInput.value = totalWeight.toFixed(2);
        }
        
        if (totalLoadsInput) {
            // Assumindo que cada carga tem capacidade máxima de 25000 kg
            totalLoadsInput.value = Math.ceil(totalWeight / 25000);
        }
    }

    // Adicionar listener para atualizar totais quando houver mudança nos itens
    itemsContainer.addEventListener('input', (e) => {
        if (e.target.type === 'number') {
            updateTotals();
        }
    });
}); 