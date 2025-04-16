import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

// Criar cliente do Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Funções auxiliares para manipulação de dados no Supabase
export const supabaseHelpers = {
    // Funções para Solicitações de Compra
    purchaseRequests: {
        async create(requestData) {
            const { data, error } = await supabase
                .from('purchase_requests')
                .insert([requestData])
                .select()
            
            if (error) throw error
            return data[0]
        },

        async getAll() {
            const { data, error } = await supabase
                .from('purchase_requests')
                .select(`
                    *,
                    items:purchase_request_items(*)
                `)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('purchase_requests')
                .select(`
                    *,
                    items:purchase_request_items(*)
                `)
                .eq('id', id)
                .single()
            
            if (error) throw error
            return data
        },

        async updateStatus(id, status, notes = null) {
            const updates = { status }
            if (notes) updates.review_notes = notes

            const { data, error } = await supabase
                .from('purchase_requests')
                .update(updates)
                .eq('id', id)
                .select()
            
            if (error) throw error
            return data[0]
        }
    },

    // Funções para Análise de Consumo
    consumptionAnalysis: {
        async create(analysisData) {
            const { data, error } = await supabase
                .from('consumption_analysis')
                .insert([analysisData])
                .select()
            
            if (error) throw error
            return data[0]
        },

        async createMany(analysisDataArray) {
            const { data, error } = await supabase
                .from('consumption_analysis')
                .insert(analysisDataArray)
                .select()
            
            if (error) throw error
            return data
        },

        async getAll(filters = {}) {
            let query = supabase
                .from('consumption_analysis')
                .select('*')
                .order('production_date', { ascending: false })

            // Aplicar filtros se fornecidos
            if (filters.client) {
                query = query.eq('client', filters.client)
            }
            if (filters.alloy) {
                query = query.eq('alloy', filters.alloy)
            }
            if (filters.startDate) {
                query = query.gte('production_date', filters.startDate)
            }
            if (filters.endDate) {
                query = query.lte('production_date', filters.endDate)
            }

            const { data, error } = await query
            if (error) throw error
            return data
        },

        async getByDateRange(startDate, endDate) {
            const { data, error } = await supabase
                .from('consumption_analysis')
                .select('*')
                .gte('production_date', startDate)
                .lte('production_date', endDate)
                .order('production_date', { ascending: true })
            
            if (error) throw error
            return data
        },

        async getAggregatedData(groupBy = 'client', timeframe = 'month') {
            // Implementar lógica de agregação conforme necessário
            const { data, error } = await supabase
                .rpc('get_aggregated_consumption', {
                    group_by: groupBy,
                    time_frame: timeframe
                })
            
            if (error) throw error
            return data
        }
    }
} 