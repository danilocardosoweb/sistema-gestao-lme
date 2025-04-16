/**
 * Utilitários para manipulação e formatação de datas
 * @module date-utils
 */

/**
 * Formata uma data para exibir apenas o mês e o ano no formato brasileiro
 * @param {Date} date - Objeto Date a ser formatado
 * @returns {string} Data formatada (ex: "Abril de 2025")
 */
export function formatMonthYear(date) {
    return new Intl.DateTimeFormat('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
    }).format(date);
}

/**
 * Formata uma data no padrão brasileiro (DD/MM/AAAA)
 * @param {Date|string} date - Objeto Date ou string de data a ser formatada
 * @returns {string} Data formatada no padrão brasileiro
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * Formata uma data e hora no padrão brasileiro (DD/MM/AAAA HH:MM)
 * @param {Date|string} date - Objeto Date ou string de data a ser formatada
 * @returns {string} Data e hora formatadas no padrão brasileiro
 */
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

/**
 * Obtém o primeiro dia do mês para uma data específica
 * @param {Date} date - Data de referência
 * @returns {Date} Primeiro dia do mês
 */
export function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtém o último dia do mês para uma data específica
 * @param {Date} date - Data de referência
 * @returns {Date} Último dia do mês
 */
export function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Adiciona dias a uma data
 * @param {Date} date - Data base
 * @param {number} days - Número de dias a adicionar (pode ser negativo)
 * @returns {Date} Nova data com os dias adicionados
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Verifica se duas datas são o mesmo dia (ignorando horas, minutos e segundos)
 * @param {Date} date1 - Primeira data
 * @param {Date} date2 - Segunda data
 * @returns {boolean} Verdadeiro se as datas representam o mesmo dia
 */
export function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

/**
 * Converte uma string de data no formato brasileiro (DD/MM/AAAA) para um objeto Date
 * @param {string} dateString - String de data no formato DD/MM/AAAA
 * @returns {Date} Objeto Date correspondente
 */
export function parseBrazilianDate(dateString) {
    const parts = dateString.split('/');
    if (parts.length !== 3) {
        throw new Error('Formato de data inválido. Use DD/MM/AAAA');
    }
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês em JavaScript é 0-indexed
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
}

/**
 * Obtém o nome do dia da semana para uma data
 * @param {Date} date - Data
 * @returns {string} Nome do dia da semana em português
 */
export function getDayOfWeekName(date) {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dayNames[date.getDay()];
}

/**
 * Obtém a abreviação do dia da semana para uma data
 * @param {Date} date - Data
 * @returns {string} Abreviação do dia da semana em português
 */
export function getDayOfWeekShortName(date) {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dayNames[date.getDay()];
}
