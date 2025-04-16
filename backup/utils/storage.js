// Chaves para o localStorage
const STORAGE_KEYS = {
    PURCHASE_REQUESTS: 'lme_purchase_requests',
    CONSUMPTION_DATA: 'lme_consumption_data',
    USER_PREFERENCES: 'lme_user_preferences',
    LAST_SYNC: 'lme_last_sync'
}

// Funções auxiliares para manipulação do localStorage
export const localStorageManager = {
    // Salvar dados
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data))
            return true
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error)
            return false
        }
    },

    // Recuperar dados
    get(key) {
        try {
            const data = localStorage.getItem(key)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error)
            return null
        }
    },

    // Remover dados
    remove(key) {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error)
            return false
        }
    },

    // Limpar todos os dados
    clear() {
        try {
            localStorage.clear()
            return true
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error)
            return false
        }
    }
}

// Funções específicas para Solicitações de Compra
export const purchaseRequestsStorage = {
    saveRequest(request) {
        const requests = localStorageManager.get(STORAGE_KEYS.PURCHASE_REQUESTS) || []
        requests.push({
            ...request,
            localId: Date.now(), // ID local para identificação
            pendingSync: true // Marca para sincronização
        })
        return localStorageManager.save(STORAGE_KEYS.PURCHASE_REQUESTS, requests)
    },

    getAllRequests() {
        return localStorageManager.get(STORAGE_KEYS.PURCHASE_REQUESTS) || []
    },

    updateRequest(localId, updatedData) {
        const requests = this.getAllRequests()
        const index = requests.findIndex(req => req.localId === localId)
        if (index !== -1) {
            requests[index] = {
                ...requests[index],
                ...updatedData,
                pendingSync: true
            }
            return localStorageManager.save(STORAGE_KEYS.PURCHASE_REQUESTS, requests)
        }
        return false
    },

    removeRequest(localId) {
        const requests = this.getAllRequests()
        const filtered = requests.filter(req => req.localId !== localId)
        return localStorageManager.save(STORAGE_KEYS.PURCHASE_REQUESTS, filtered)
    },

    getPendingSyncs() {
        const requests = this.getAllRequests()
        return requests.filter(req => req.pendingSync)
    },

    markAsSynced(localId, serverData) {
        const requests = this.getAllRequests()
        const index = requests.findIndex(req => req.localId === localId)
        if (index !== -1) {
            requests[index] = {
                ...requests[index],
                ...serverData,
                pendingSync: false
            }
            return localStorageManager.save(STORAGE_KEYS.PURCHASE_REQUESTS, requests)
        }
        return false
    }
}

// Funções específicas para Análise de Consumo
export const consumptionAnalysisStorage = {
    saveData(data) {
        const existingData = localStorageManager.get(STORAGE_KEYS.CONSUMPTION_DATA) || []
        existingData.push({
            ...data,
            localId: Date.now(),
            pendingSync: true
        })
        return localStorageManager.save(STORAGE_KEYS.CONSUMPTION_DATA, existingData)
    },

    saveMultipleData(dataArray) {
        const existingData = localStorageManager.get(STORAGE_KEYS.CONSUMPTION_DATA) || []
        const newData = dataArray.map(data => ({
            ...data,
            localId: Date.now() + Math.random(),
            pendingSync: true
        }))
        existingData.push(...newData)
        return localStorageManager.save(STORAGE_KEYS.CONSUMPTION_DATA, existingData)
    },

    getAllData() {
        return localStorageManager.get(STORAGE_KEYS.CONSUMPTION_DATA) || []
    },

    getPendingSyncs() {
        const data = this.getAllData()
        return data.filter(item => item.pendingSync)
    },

    markAsSynced(localId, serverData) {
        const data = this.getAllData()
        const index = data.findIndex(item => item.localId === localId)
        if (index !== -1) {
            data[index] = {
                ...data[index],
                ...serverData,
                pendingSync: false
            }
            return localStorageManager.save(STORAGE_KEYS.CONSUMPTION_DATA, data)
        }
        return false
    },

    updateLastSync() {
        return localStorageManager.save(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    },

    getLastSync() {
        return localStorageManager.get(STORAGE_KEYS.LAST_SYNC)
    }
}

// Funções para preferências do usuário
export const userPreferencesStorage = {
    savePreferences(preferences) {
        return localStorageManager.save(STORAGE_KEYS.USER_PREFERENCES, preferences)
    },

    getPreferences() {
        return localStorageManager.get(STORAGE_KEYS.USER_PREFERENCES) || {}
    },

    updatePreference(key, value) {
        const preferences = this.getPreferences()
        preferences[key] = value
        return this.savePreferences(preferences)
    }
} 