/**
 * Utilitários para validação de formulários e dados
 * @module validation
 */

/**
 * Verifica se um campo obrigatório está preenchido
 * @param {string} value - Valor do campo
 * @returns {boolean} Verdadeiro se o campo está preenchido
 */
export function isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Verifica se um valor é um número válido
 * @param {string|number} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor é um número válido
 */
export function isNumber(value) {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value !== 'string') return false;
    
    // Converter formato brasileiro (1.000,00) para formato que parseFloat entende
    const normalizedValue = value.replace(/\./g, '').replace(',', '.');
    return !isNaN(parseFloat(normalizedValue)) && isFinite(normalizedValue);
}

/**
 * Verifica se um valor é maior que zero
 * @param {string|number} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor é maior que zero
 */
export function isPositive(value) {
    if (!isNumber(value)) return false;
    
    // Converter formato brasileiro se necessário
    let numValue = value;
    if (typeof value === 'string') {
        numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    }
    
    return numValue > 0;
}

/**
 * Verifica se uma data é válida
 * @param {string} dateStr - String de data no formato DD/MM/AAAA
 * @returns {boolean} Verdadeiro se a data é válida
 */
export function isValidDate(dateStr) {
    if (!dateStr) return false;
    
    // Verificar formato DD/MM/AAAA
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Mês em JavaScript é 0-indexed
    const year = parseInt(match[3], 10);
    
    const date = new Date(year, month, day);
    
    // Verificar se a data é válida comparando os componentes
    return date.getDate() === day && 
           date.getMonth() === month && 
           date.getFullYear() === year;
}

/**
 * Verifica se uma data é futura (maior que a data atual)
 * @param {string} dateStr - String de data no formato DD/MM/AAAA
 * @returns {boolean} Verdadeiro se a data é futura
 */
export function isFutureDate(dateStr) {
    if (!isValidDate(dateStr)) return false;
    
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const inputDate = new Date(year, month, day);
    inputDate.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate > today;
}

/**
 * Valida um formulário completo
 * @param {Object} formData - Objeto com os dados do formulário
 * @param {Object} validationRules - Regras de validação para cada campo
 * @returns {Object} Objeto com erros encontrados (vazio se não houver erros)
 */
export function validateForm(formData, validationRules) {
    const errors = {};
    
    for (const field in validationRules) {
        const rules = validationRules[field];
        const value = formData[field];
        
        for (const rule of rules) {
            switch (rule.type) {
                case 'required':
                    if (!isRequired(value)) {
                        errors[field] = rule.message || 'Campo obrigatório';
                    }
                    break;
                    
                case 'number':
                    if (isRequired(value) && !isNumber(value)) {
                        errors[field] = rule.message || 'Deve ser um número válido';
                    }
                    break;
                    
                case 'positive':
                    if (isRequired(value) && !isPositive(value)) {
                        errors[field] = rule.message || 'Deve ser maior que zero';
                    }
                    break;
                    
                case 'date':
                    if (isRequired(value) && !isValidDate(value)) {
                        errors[field] = rule.message || 'Data inválida';
                    }
                    break;
                    
                case 'futureDate':
                    if (isRequired(value) && !isFutureDate(value)) {
                        errors[field] = rule.message || 'A data deve ser futura';
                    }
                    break;
                    
                case 'custom':
                    if (rule.validate && !rule.validate(value, formData)) {
                        errors[field] = rule.message || 'Valor inválido';
                    }
                    break;
            }
            
            // Se já encontrou um erro para este campo, não continuar validando
            if (errors[field]) break;
        }
    }
    
    return errors;
}

/**
 * Verifica se um objeto de erros está vazio (sem erros)
 * @param {Object} errors - Objeto de erros retornado por validateForm
 * @returns {boolean} Verdadeiro se não há erros
 */
export function isFormValid(errors) {
    return Object.keys(errors).length === 0;
}

/**
 * Exibe mensagens de erro nos elementos do formulário
 * @param {Object} errors - Objeto de erros retornado por validateForm
 * @param {string} errorClass - Classe CSS a ser adicionada aos campos com erro
 * @param {Function} errorMessageCallback - Função para exibir mensagem de erro
 */
export function displayFormErrors(errors, errorClass = 'is-invalid', errorMessageCallback) {
    // Limpar erros anteriores
    document.querySelectorAll(`.${errorClass}`).forEach(el => {
        el.classList.remove(errorClass);
    });
    
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
    
    // Exibir novos erros
    for (const field in errors) {
        const element = document.getElementById(field);
        if (element) {
            element.classList.add(errorClass);
            
            if (errorMessageCallback) {
                errorMessageCallback(element, errors[field]);
            } else {
                // Implementação padrão para exibir mensagem de erro
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errors[field];
                
                if (element.parentNode) {
                    element.parentNode.appendChild(errorDiv);
                }
            }
        }
    }
}
