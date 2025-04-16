-- Função para obter dados agregados de consumo
CREATE OR REPLACE FUNCTION get_aggregated_consumption(
    group_by text,
    time_frame text
)
RETURNS TABLE (
    group_key text,
    period text,
    total_gross numeric,
    total_net numeric,
    avg_efficiency numeric,
    total_records bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH grouped_data AS (
        SELECT
            CASE 
                WHEN group_by = 'client' THEN client
                WHEN group_by = 'alloy' THEN alloy
                ELSE 'all'
            END as group_key,
            CASE
                WHEN time_frame = 'day' THEN TO_CHAR(production_date, 'YYYY-MM-DD')
                WHEN time_frame = 'week' THEN TO_CHAR(DATE_TRUNC('week', production_date), 'YYYY-MM-DD')
                WHEN time_frame = 'month' THEN TO_CHAR(DATE_TRUNC('month', production_date), 'YYYY-MM')
                ELSE TO_CHAR(DATE_TRUNC('year', production_date), 'YYYY')
            END as period,
            SUM(gross_quantity) as total_gross,
            SUM(net_quantity) as total_net,
            AVG(efficiency) as avg_efficiency,
            COUNT(*) as total_records
        FROM consumption_analysis
        GROUP BY 1, 2
        ORDER BY period DESC, group_key
    )
    SELECT * FROM grouped_data;
END;
$$;

-- Função para calcular estatísticas de eficiência por cliente
CREATE OR REPLACE FUNCTION get_efficiency_stats(
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL
)
RETURNS TABLE (
    client text,
    avg_efficiency numeric,
    min_efficiency numeric,
    max_efficiency numeric,
    efficiency_stddev numeric,
    total_records bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.client,
        ROUND(AVG(ca.efficiency)::numeric, 2) as avg_efficiency,
        MIN(ca.efficiency) as min_efficiency,
        MAX(ca.efficiency) as max_efficiency,
        ROUND(STDDEV(ca.efficiency)::numeric, 2) as efficiency_stddev,
        COUNT(*) as total_records
    FROM consumption_analysis ca
    WHERE 
        (start_date IS NULL OR ca.production_date >= start_date) AND
        (end_date IS NULL OR ca.production_date <= end_date)
    GROUP BY ca.client
    ORDER BY avg_efficiency DESC;
END;
$$;

-- Função para calcular tendências de consumo
CREATE OR REPLACE FUNCTION get_consumption_trends(
    p_client text DEFAULT NULL,
    p_alloy text DEFAULT NULL,
    p_months integer DEFAULT 6
)
RETURNS TABLE (
    month text,
    total_gross numeric,
    total_net numeric,
    mom_change numeric,
    trend_direction text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT
            TO_CHAR(DATE_TRUNC('month', production_date), 'YYYY-MM') as month,
            SUM(gross_quantity) as total_gross,
            SUM(net_quantity) as total_net
        FROM consumption_analysis
        WHERE 
            (p_client IS NULL OR client = p_client) AND
            (p_alloy IS NULL OR alloy = p_alloy) AND
            production_date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months || ' months')::interval
        GROUP BY 1
        ORDER BY 1
    ),
    with_change AS (
        SELECT
            month,
            total_gross,
            total_net,
            ROUND(
                ((total_net - LAG(total_net) OVER (ORDER BY month)) / 
                NULLIF(LAG(total_net) OVER (ORDER BY month), 0) * 100)::numeric,
                2
            ) as mom_change
        FROM monthly_data
    )
    SELECT
        month,
        total_gross,
        total_net,
        mom_change,
        CASE
            WHEN mom_change > 0 THEN 'up'
            WHEN mom_change < 0 THEN 'down'
            ELSE 'stable'
        END as trend_direction
    FROM with_change
    ORDER BY month DESC;
END;
$$;

-- Função para identificar anomalias na eficiência
CREATE OR REPLACE FUNCTION get_efficiency_anomalies(
    threshold numeric DEFAULT 2.0  -- Número de desvios padrão para considerar anomalia
)
RETURNS TABLE (
    id bigint,
    client text,
    production_date date,
    efficiency numeric,
    zscore numeric,
    is_anomaly boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            client,
            AVG(efficiency) as avg_efficiency,
            STDDEV(efficiency) as stddev_efficiency
        FROM consumption_analysis
        GROUP BY client
    ),
    with_zscore AS (
        SELECT
            ca.id,
            ca.client,
            ca.production_date,
            ca.efficiency,
            CASE 
                WHEN s.stddev_efficiency = 0 THEN 0
                ELSE ((ca.efficiency - s.avg_efficiency) / s.stddev_efficiency)
            END as zscore
        FROM consumption_analysis ca
        JOIN stats s ON ca.client = s.client
    )
    SELECT
        id,
        client,
        production_date,
        efficiency,
        ROUND(zscore::numeric, 2) as zscore,
        ABS(zscore) > threshold as is_anomaly
    FROM with_zscore
    WHERE ABS(zscore) > threshold
    ORDER BY ABS(zscore) DESC;
END;
$$; 