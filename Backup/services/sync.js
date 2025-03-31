import { supabase } from '../config/supabase'
import { purchaseRequestsStorage, consumptionAnalysisStorage } from '../utils/storage'

// Intervalo de sincronização em milissegundos (5 minutos)
const SYNC_INTERVAL = 5 * 60 * 1000

export const syncService = {
    // Iniciar sincronização automática
    startAutoSync() {
        this.syncAll() // Sincroniza imediatamente
        setInterval(() => this.syncAll(), SYNC_INTERVAL)
    },

    // Sincronizar todos os dados pendentes
    async syncAll() {
        try {
            await Promise.all([
                this.syncPurchaseRequests(),
                this.syncConsumptionData()
            ])
            console.log('Sincronização completa')
        } catch (error) {
            console.error('Erro na sincronização:', error)
        }
    },

    // Sincronizar solicitações de compra
    async syncPurchaseRequests() {
        const pendingRequests = purchaseRequestsStorage.getPendingSyncs()
        
        for (const request of pendingRequests) {
            try {
                const { data, error } = await supabase
                    .from('purchase_requests')
                    .insert([{
                        client_name: request.clientName,
                        total_weight: request.totalWeight,
                        total_loads: request.totalLoads,
                        status: request.status,
                        review_notes: request.reviewNotes
                    }])
                    .select()

                if (error) throw error

                // Se a inserção foi bem sucedida, salvar os itens da solicitação
                if (data && data[0]) {
                    const requestId = data[0].id
                    
                    // Inserir itens da solicitação
                    const { error: itemsError } = await supabase
                        .from('purchase_request_items')
                        .insert(request.items.map(item => ({
                            purchase_request_id: requestId,
                            supplier: item.supplier,
                            alloy: item.alloy,
                            product_description: item.productDescription,
                            purchase_type: item.purchaseType,
                            quantity: item.quantity,
                            delivery_date: item.deliveryDate
                        })))

                    if (itemsError) throw itemsError

                    // Marcar como sincronizado no localStorage
                    purchaseRequestsStorage.markAsSynced(request.localId, {
                        ...data[0],
                        items: request.items
                    })
                }
            } catch (error) {
                console.error('Erro ao sincronizar solicitação:', error)
            }
        }
    },

    // Sincronizar dados de análise de consumo
    async syncConsumptionData() {
        const pendingData = consumptionAnalysisStorage.getPendingSyncs()
        
        for (const item of pendingData) {
            try {
                const { data, error } = await supabase
                    .from('consumption_analysis')
                    .insert([{
                        client: item.client,
                        alloy: item.alloy,
                        production_date: item.productionDate,
                        gross_quantity: item.grossQuantity,
                        net_quantity: item.netQuantity,
                        efficiency: item.efficiency
                    }])
                    .select()

                if (error) throw error

                if (data && data[0]) {
                    // Marcar como sincronizado no localStorage
                    consumptionAnalysisStorage.markAsSynced(item.localId, data[0])
                }
            } catch (error) {
                console.error('Erro ao sincronizar análise de consumo:', error)
            }
        }

        // Atualizar timestamp da última sincronização
        consumptionAnalysisStorage.updateLastSync()
    },

    // Verificar status da conexão
    async checkConnection() {
        try {
            const { error } = await supabase.from('purchase_requests').select('id').limit(1)
            return !error
        } catch {
            return false
        }
    },

    // Forçar sincronização manual
    async forceSyncAll() {
        const isConnected = await this.checkConnection()
        if (!isConnected) {
            throw new Error('Sem conexão com o servidor')
        }
        return this.syncAll()
    }
} 