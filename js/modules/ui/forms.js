/**
 * Módulo para manipulação de formulários
 * @module forms
 */

import { showToast } from './notifications.js';
import * as validation from '../utils/validation.js';

/**
 * Dados de produtos por fornecedor e liga
 * @type {Object}
 */
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

/**
 * Elementos do formulário
 * @type {Object}
 */
let formElements = {
    form: null,
    supplierSelect: null,
    alloySelect: null,
    productDescriptionSelect: null,
    purchaseTypeSelect: null,
    quantityInput: null,
    deliveryDateInput: null
};

/**
 * Callbacks para eventos do formulário
 * @type {Object}
 */
let callbacks = {
    onSubmit: null,
    onChange: null
};

/**
 * Inicializa o módulo de formulários
 * @param {Object} elements - Elementos do formulário
 * @param {Object} eventCallbacks - Callbacks para eventos
 */
export function initForms(elements, eventCallbacks = {}) {
    formElements = { ...formElements, ...elements };
    callbacks = { ...callbacks, ...eventCallbacks };
    
    // Verificar se os elementos essenciais existem
    if (!formElements.form || !formElements.supplierSelect || !formElements.alloySelect || !formElements.productDescriptionSelect) {
        console.error('Elementos essenciais do formulário não encontrados');
        return;
    }
    
    // Configuração inicial: desabilitar os selects de liga e descrição
    formElements.alloySelect.disabled = true;
    formElements.productDescriptionSelect.disabled = true;
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('Módulo de formulários inicializado');
}

/**
 * Configura os event listeners do formulário
 */
function setupEventListeners() {
    // Event listener para o fornecedor
    formElements.supplierSelect.addEventListener('change', function() {
        console.log('Fornecedor alterado:', this.value);
        updateAlloyOptions();
        
        if (callbacks.onChange) {
            callbacks.onChange('supplier', this.value);
        }
    });
    
    // Event listener para a liga
    formElements.alloySelect.addEventListener('change', function() {
        console.log('Liga alterada:', this.value);
        updateProductDescriptions();
        
        if (callbacks.onChange) {
            callbacks.onChange('alloy', this.value);
        }
    });
    
    // Event listener para o formulário
    formElements.form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = getFormData();
        
        // Validar formulário
        const errors = validatePurchaseForm(formData);
        
        if (Object.keys(errors).length > 0) {
            // Exibir erros
            displayFormErrors(errors);
            return;
        }
        
        // Chamar callback de submit se existir
        if (callbacks.onSubmit) {
            callbacks.onSubmit(formData);
        }
    });
    
    // Event listeners para outros campos
    ['productDescriptionSelect', 'purchaseTypeSelect', 'quantityInput', 'deliveryDateInput'].forEach(fieldName => {
        const element = formElements[fieldName];
        if (element) {
            element.addEventListener('change', function() {
                if (callbacks.onChange) {
                    callbacks.onChange(fieldName.replace('Select', '').replace('Input', ''), this.value);
                }
            });
        }
    });
}

/**
 * Atualiza as opções de liga com base no fornecedor selecionado
 */
export function updateAlloyOptions() {
    const supplier = formElements.supplierSelect.value;
    
    // Limpar select de liga
    formElements.alloySelect.innerHTML = '<option value="">Selecione a liga</option>';
    
    // Limpar e desabilitar select de descrição
    formElements.productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
    formElements.productDescriptionSelect.disabled = true;
    
    // Se não tiver fornecedor selecionado, desabilitar select de liga
    if (!supplier) {
        formElements.alloySelect.disabled = true;
        return;
    }
    
    // Habilitar select de liga
    formElements.alloySelect.disabled = false;
    
    // Preencher opções de liga para o fornecedor selecionado
    if (productData[supplier]) {
        const alloys = Object.keys(productData[supplier]);
        alloys.forEach(alloy => {
            const option = document.createElement('option');
            option.value = alloy;
            option.textContent = alloy;
            formElements.alloySelect.appendChild(option);
        });
    }
}

/**
 * Atualiza as descrições de produtos com base no fornecedor e liga selecionados
 */
export function updateProductDescriptions() {
    const supplier = formElements.supplierSelect.value;
    const alloy = formElements.alloySelect.value;
    
    console.log('Atualizando descrições:', { supplier, alloy });
    
    // Limpar select de descrição
    formElements.productDescriptionSelect.innerHTML = '<option value="">Selecione a descrição</option>';
    
    // Se não tiver fornecedor ou liga selecionados, desabilitar select de descrição
    if (!supplier || !alloy) {
        formElements.productDescriptionSelect.disabled = true;
        return;
    }
    
    // Habilitar select de descrição
    formElements.productDescriptionSelect.disabled = false;
    
    // Preencher opções de descrição para o fornecedor e liga selecionados
    if (productData[supplier] && productData[supplier][alloy]) {
        const descriptions = productData[supplier][alloy];
        descriptions.forEach(description => {
            const option = document.createElement('option');
            option.value = description;
            option.textContent = description;
            formElements.productDescriptionSelect.appendChild(option);
        });
        
        // Se só tiver uma opção, selecionar automaticamente
        if (descriptions.length === 1) {
            formElements.productDescriptionSelect.value = descriptions[0];
        }
    }
}

/**
 * Configura um contador de caracteres para um textarea
 * @param {HTMLElement} textarea - Elemento textarea
 * @param {HTMLElement} counterElement - Elemento para exibir o contador
 * @param {number} maxLength - Tamanho máximo permitido
 */
export function setupTextareaCharCounter(textarea, counterElement, maxLength = 500) {
    if (!textarea || !counterElement) {
        console.error('Elementos do contador de caracteres não encontrados');
        return;
    }
    
    // Definir o atributo maxlength no textarea
    textarea.setAttribute('maxlength', maxLength);
    
    // Função para atualizar o contador de caracteres
    function updateCharCount() {
        const currentLength = textarea.value.length;
        counterElement.textContent = currentLength;
        
        // Adicionar classe de alerta quando estiver próximo do limite
        const charCounter = counterElement.parentElement;
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
    
    // Inicializar contador
    updateCharCount();
    
    console.log('Contador de caracteres configurado para o textarea');
}

/**
 * Obtém os dados do formulário
 * @returns {Object} Dados do formulário
 */
export function getFormData() {
    return {
        supplier: formElements.supplierSelect.value,
        alloy: formElements.alloySelect.value,
        productDescription: formElements.productDescriptionSelect.value,
        purchaseType: formElements.purchaseTypeSelect ? formElements.purchaseTypeSelect.value : '',
        quantity: formElements.quantityInput ? parseInt(formElements.quantityInput.value, 10) : 0,
        deliveryDate: formElements.deliveryDateInput ? formElements.deliveryDateInput.value : ''
    };
}

/**
 * Preenche o formulário com dados
 * @param {Object} data - Dados para preencher o formulário
 */
export function setFormData(data) {
    // Preencher fornecedor
    if (data.supplier && formElements.supplierSelect) {
        formElements.supplierSelect.value = data.supplier;
        updateAlloyOptions();
    }
    
    // Preencher liga
    if (data.alloy && formElements.alloySelect) {
        formElements.alloySelect.value = data.alloy;
        updateProductDescriptions();
    }
    
    // Preencher descrição
    if (data.productDescription && formElements.productDescriptionSelect) {
        formElements.productDescriptionSelect.value = data.productDescription;
    }
    
    // Preencher tipo de compra
    if (data.purchaseType && formElements.purchaseTypeSelect) {
        formElements.purchaseTypeSelect.value = data.purchaseType;
    }
    
    // Preencher quantidade
    if (data.quantity && formElements.quantityInput) {
        formElements.quantityInput.value = data.quantity;
    }
    
    // Preencher data de entrega
    if (data.deliveryDate && formElements.deliveryDateInput) {
        formElements.deliveryDateInput.value = data.deliveryDate;
    }
}

/**
 * Limpa o formulário
 * @param {boolean} [keepSupplierAndAlloy=false] - Se deve manter o fornecedor e liga selecionados
 */
export function resetForm(keepSupplierAndAlloy = false) {
    const currentSupplier = keepSupplierAndAlloy ? formElements.supplierSelect.value : '';
    const currentAlloy = keepSupplierAndAlloy ? formElements.alloySelect.value : '';
    
    // Limpar todos os campos
    formElements.form.reset();
    
    // Manter fornecedor e liga se necessário
    if (keepSupplierAndAlloy) {
        formElements.supplierSelect.value = currentSupplier;
        formElements.alloySelect.value = currentAlloy;
        updateProductDescriptions();
    }
}

/**
 * Valida o formulário de compra
 * @param {Object} formData - Dados do formulário
 * @returns {Object} Objeto com erros encontrados
 */
export function validatePurchaseForm(formData) {
    const validationRules = {
        supplier: [
            { type: 'required', message: 'Selecione um fornecedor' }
        ],
        alloy: [
            { type: 'required', message: 'Selecione uma liga' }
        ],
        productDescription: [
            { type: 'required', message: 'Selecione uma descrição de produto' }
        ],
        purchaseType: [
            { type: 'required', message: 'Selecione um tipo de compra' }
        ],
        quantity: [
            { type: 'required', message: 'Informe a quantidade' },
            { type: 'number', message: 'A quantidade deve ser um número válido' },
            { type: 'positive', message: 'A quantidade deve ser maior que zero' }
        ],
        deliveryDate: [
            { type: 'required', message: 'Informe a data de entrega' },
            { type: 'date', message: 'Data inválida. Use o formato DD/MM/AAAA' },
            { type: 'futureDate', message: 'A data de entrega deve ser futura' }
        ]
    };
    
    return validation.validateForm(formData, validationRules);
}

/**
 * Exibe mensagens de erro nos elementos do formulário
 * @param {Object} errors - Objeto com erros encontrados
 */
export function displayFormErrors(errors) {
    // Limpar erros anteriores
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
    
    // Exibir novos erros
    for (const field in errors) {
        const elementId = field;
        const element = document.getElementById(elementId);
        
        if (element) {
            element.classList.add('is-invalid');
            
            // Criar e adicionar mensagem de erro
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errors[field];
            
            if (element.parentNode) {
                element.parentNode.appendChild(errorDiv);
            }
        }
    }
    
    // Mostrar toast com o primeiro erro
    const firstError = Object.values(errors)[0];
    if (firstError) {
        showToast(firstError, 'error');
    }
}
