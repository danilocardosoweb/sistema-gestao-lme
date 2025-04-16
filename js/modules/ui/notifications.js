/**
 * Módulo para gerenciamento de notificações e toasts
 * @module notifications
 */

/**
 * Configurações padrão para os toasts
 * @type {Object}
 */
const defaultConfig = {
    duration: 3000,
    position: 'bottom-right',
    containerClass: 'toast-container',
    toastClass: 'toast',
    closeButtonClass: 'toast-close',
    autoClose: true,
    showCloseButton: true,
    maxToasts: 5
};

/**
 * Configuração atual dos toasts
 * @type {Object}
 */
let config = { ...defaultConfig };

/**
 * Fila de toasts ativos
 * @type {Array}
 */
let activeToasts = [];

/**
 * Inicializa o sistema de notificações
 * @param {Object} customConfig - Configurações personalizadas
 */
export function initNotifications(customConfig = {}) {
    config = { ...defaultConfig, ...customConfig };
    
    // Criar container de toasts se não existir
    if (!document.querySelector(`.${config.containerClass}`)) {
        const container = document.createElement('div');
        container.className = config.containerClass;
        container.style.position = 'fixed';
        
        // Definir posição do container
        switch (config.position) {
            case 'top-right':
                container.style.top = '20px';
                container.style.right = '20px';
                break;
            case 'top-left':
                container.style.top = '20px';
                container.style.left = '20px';
                break;
            case 'bottom-left':
                container.style.bottom = '20px';
                container.style.left = '20px';
                break;
            case 'bottom-right':
            default:
                container.style.bottom = '20px';
                container.style.right = '20px';
                break;
        }
        
        document.body.appendChild(container);
    }
}

/**
 * Mostra uma notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} [type='success'] - Tipo de toast (success, error, warning, info)
 * @param {Object} [customConfig={}] - Configurações personalizadas para este toast
 * @returns {HTMLElement} Elemento do toast criado
 */
export function showToast(message, type = 'success', customConfig = {}) {
    const toastConfig = { ...config, ...customConfig };
    const container = document.querySelector(`.${toastConfig.containerClass}`);
    
    // Se não houver container, inicializar o sistema
    if (!container) {
        initNotifications();
        return showToast(message, type, customConfig);
    }
    
    // Limitar número de toasts ativos
    if (activeToasts.length >= toastConfig.maxToasts) {
        const oldestToast = activeToasts.shift();
        if (oldestToast && oldestToast.parentNode) {
            oldestToast.parentNode.removeChild(oldestToast);
        }
    }
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `${toastConfig.toastClass} ${toastConfig.toastClass}-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-message">${message}</div>
            ${toastConfig.showCloseButton ? `<button class="${toastConfig.closeButtonClass}">&times;</button>` : ''}
        </div>
    `;
    
    // Adicionar ao container
    container.appendChild(toast);
    
    // Adicionar à lista de toasts ativos
    activeToasts.push(toast);
    
    // Configurar botão de fechar
    if (toastConfig.showCloseButton) {
        const closeButton = toast.querySelector(`.${toastConfig.closeButtonClass}`);
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                removeToast(toast);
            });
        }
    }
    
    // Auto-fechar após duração configurada
    if (toastConfig.autoClose) {
        setTimeout(() => {
            removeToast(toast);
        }, toastConfig.duration);
    }
    
    return toast;
}

/**
 * Remove um toast específico
 * @param {HTMLElement} toast - Elemento do toast a ser removido
 */
function removeToast(toast) {
    // Adicionar classe para animação de saída
    toast.classList.add('toast-removing');
    
    // Remover após animação
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Remover da lista de toasts ativos
        const index = activeToasts.indexOf(toast);
        if (index !== -1) {
            activeToasts.splice(index, 1);
        }
    }, 300); // Tempo da animação
}

/**
 * Limpa todos os toasts ativos
 */
export function clearAllToasts() {
    const container = document.querySelector(`.${config.containerClass}`);
    if (container) {
        container.innerHTML = '';
        activeToasts = [];
    }
}

/**
 * Atalho para mostrar toast de sucesso
 * @param {string} message - Mensagem a ser exibida
 * @param {Object} [customConfig={}] - Configurações personalizadas
 * @returns {HTMLElement} Elemento do toast criado
 */
export function success(message, customConfig = {}) {
    return showToast(message, 'success', customConfig);
}

/**
 * Atalho para mostrar toast de erro
 * @param {string} message - Mensagem a ser exibida
 * @param {Object} [customConfig={}] - Configurações personalizadas
 * @returns {HTMLElement} Elemento do toast criado
 */
export function error(message, customConfig = {}) {
    return showToast(message, 'error', customConfig);
}

/**
 * Atalho para mostrar toast de aviso
 * @param {string} message - Mensagem a ser exibida
 * @param {Object} [customConfig={}] - Configurações personalizadas
 * @returns {HTMLElement} Elemento do toast criado
 */
export function warning(message, customConfig = {}) {
    return showToast(message, 'warning', customConfig);
}

/**
 * Atalho para mostrar toast informativo
 * @param {string} message - Mensagem a ser exibida
 * @param {Object} [customConfig={}] - Configurações personalizadas
 * @returns {HTMLElement} Elemento do toast criado
 */
export function info(message, customConfig = {}) {
    return showToast(message, 'info', customConfig);
}
