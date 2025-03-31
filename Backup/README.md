# Sistema de Gestão de Compras e Análise de Consumo de Alumínio

## Descrição
Sistema para gerenciamento de solicitações de compra e análise de consumo de alumínio, com funcionalidades de armazenamento local e sincronização com banco de dados Supabase.

## Funcionalidades Principais
- Gestão de solicitações de compra
- Análise de consumo de alumínio
- Armazenamento local com localStorage
- Sincronização automática com Supabase
- Análises estatísticas e identificação de anomalias
- Geração de relatórios e gráficos

## Configuração do Ambiente

### Pré-requisitos
- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Supabase

### Instalação
1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd [NOME_DO_DIRETORIO]
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis com suas credenciais do Supabase
```bash
cp .env.example .env
```

4. Configure o banco de dados Supabase:
- Acesse o console do Supabase
- Execute os scripts SQL localizados em `sql/functions.sql`
- Verifique se as tabelas e funções foram criadas corretamente

### Estrutura do Banco de Dados
O sistema utiliza as seguintes tabelas no Supabase:

#### purchase_requests
- id (bigint, primary key)
- client_name (text)
- created_at (timestamp)
- status (text)
- total_weight (numeric)
- total_loads (integer)
- review_notes (text)

#### purchase_request_items
- id (bigint, primary key)
- purchase_request_id (bigint, foreign key)
- supplier (text)
- alloy (text)
- product_description (text)
- purchase_type (text)
- quantity (numeric)
- delivery_date (date)

#### consumption_analysis
- id (bigint, primary key)
- client (text)
- alloy (text)
- production_date (date)
- gross_quantity (numeric)
- net_quantity (numeric)
- efficiency (numeric)
- created_at (timestamp)

### Funções SQL Disponíveis
- get_aggregated_consumption: Agregação de dados de consumo
- get_efficiency_stats: Estatísticas de eficiência por cliente
- get_consumption_trends: Análise de tendências de consumo
- get_efficiency_anomalies: Identificação de anomalias na eficiência

## Desenvolvimento

### Estrutura do Projeto
```
├── config/
│   └── supabase.js
├── services/
│   └── sync.js
├── utils/
│   └── storage.js
├── sql/
│   └── functions.sql
└── ...
```

### Sincronização de Dados
O sistema implementa uma estratégia de sincronização que:
1. Armazena dados localmente primeiro
2. Sincroniza automaticamente a cada 5 minutos
3. Permite sincronização manual
4. Mantém registro de itens pendentes de sincronização
5. Lida com conflitos e erros de rede

## Uso
1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Acesse a aplicação em `http://localhost:3000`

3. Para forçar uma sincronização manual:
```javascript
await syncService.forceSyncAll()
```

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.