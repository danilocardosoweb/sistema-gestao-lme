-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Criar enum para status das solicitações (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'in_progress',
            'completed',
            'cancelled'
        );
    END IF;
END $$;

-- Criar tabela de solicitações de compra
CREATE TABLE IF NOT EXISTS purchase_requests (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_name text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status request_status DEFAULT 'pending',
    total_weight numeric(10,2) NOT NULL,
    total_loads integer NOT NULL,
    review_notes text
);

-- Criar tabela de itens das solicitações
CREATE TABLE IF NOT EXISTS purchase_request_items (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    purchase_request_id bigint REFERENCES purchase_requests(id) ON DELETE CASCADE,
    supplier text NOT NULL,
    alloy text NOT NULL,
    product_description text NOT NULL,
    purchase_type text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    delivery_date date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de análise de consumo
CREATE TABLE IF NOT EXISTS consumption_analysis (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client text NOT NULL,
    alloy text NOT NULL,
    production_date date NOT NULL,
    gross_quantity numeric(10,2) NOT NULL,
    net_quantity numeric(10,2) NOT NULL,
    efficiency numeric(5,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_client ON purchase_requests(client_name);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_created_at ON purchase_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_request_items_request ON purchase_request_items(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_request_items_supplier ON purchase_request_items(supplier);
CREATE INDEX IF NOT EXISTS idx_purchase_request_items_alloy ON purchase_request_items(alloy);
CREATE INDEX IF NOT EXISTS idx_purchase_request_items_delivery ON purchase_request_items(delivery_date);

CREATE INDEX IF NOT EXISTS idx_consumption_analysis_client ON consumption_analysis(client);
CREATE INDEX IF NOT EXISTS idx_consumption_analysis_alloy ON consumption_analysis(alloy);
CREATE INDEX IF NOT EXISTS idx_consumption_analysis_date ON consumption_analysis(production_date);
CREATE INDEX IF NOT EXISTS idx_consumption_analysis_efficiency ON consumption_analysis(efficiency);

-- Criar função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_purchase_requests_updated_at
    BEFORE UPDATE ON purchase_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_request_items_updated_at
    BEFORE UPDATE ON purchase_request_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumption_analysis_updated_at
    BEFORE UPDATE ON consumption_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas RLS (Row Level Security)
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_analysis ENABLE ROW LEVEL SECURITY;

-- Política para purchase_requests
CREATE POLICY "Permitir acesso total às solicitações"
    ON purchase_requests FOR ALL
    USING (true)
    WITH CHECK (true);

-- Política para purchase_request_items
CREATE POLICY "Permitir acesso total aos itens"
    ON purchase_request_items FOR ALL
    USING (true)
    WITH CHECK (true);

-- Política para consumption_analysis
CREATE POLICY "Permitir acesso total às análises"
    ON consumption_analysis FOR ALL
    USING (true)
    WITH CHECK (true); 