/**
 * Formata um número com o número especificado de casas decimais
 * @param {number} number - O número a ser formatado
 * @param {number} precision - O número de casas decimais
 * @returns {string} O número formatado
 */
export const formatNumber = (number, precision = 2) => {
    return Number(number).toLocaleString('pt-BR', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    });
};

/**
 * Formata uma data no padrão brasileiro
 * @param {string|Date} date - A data a ser formatada
 * @returns {string} A data formatada
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
};

/**
 * Formata uma variação percentual
 * @param {number} value - O valor da variação
 * @param {number} precision - O número de casas decimais
 * @returns {string} A variação formatada
 */
export const formatVariation = (value, precision = 2) => {
    return Math.abs(value).toLocaleString('pt-BR', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    });
};

/**
 * Formata um valor monetário
 * @param {number} value - O valor a ser formatado
 * @param {string} currency - O código da moeda (ex: 'BRL', 'USD')
 * @returns {string} O valor monetário formatado
 */
export const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(value);
}; 