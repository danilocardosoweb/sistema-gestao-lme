import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Carregar variáveis de ambiente
dotenv.config()

// Criar cliente do Supabase para testes
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

async function testConnection() {
    try {
        // Testar conexão com a tabela purchase_requests
        const { data: requests, error: requestsError } = await supabase
            .from('purchase_requests')
            .select('count');
        
        if (requestsError) throw requestsError;
        console.log('✅ Conexão com purchase_requests estabelecida');

        // Testar conexão com a tabela consumption_analysis
        const { data: analysis, error: analysisError } = await supabase
            .from('consumption_analysis')
            .select('count');
        
        if (analysisError) throw analysisError;
        console.log('✅ Conexão com consumption_analysis estabelecida');

        // Testar função de agregação
        const { data: aggregated, error: aggregatedError } = await supabase
            .rpc('get_aggregated_consumption', {
                group_by: 'client',
                time_frame: 'month'
            });
        
        if (aggregatedError) throw aggregatedError;
        console.log('✅ Função de agregação funcionando');

        console.log('\n🎉 Todas as conexões e funções estão funcionando corretamente!');
    } catch (error) {
        console.error('❌ Erro ao testar conexão:', error.message);
    }
}

// Executar teste
testConnection(); 