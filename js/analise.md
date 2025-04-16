# Análise do Arquivo purchase_request.js

## Estrutura Atual

O arquivo `purchase_request.js` é um arquivo monolítico que contém toda a lógica do sistema de solicitações de compra. Ele possui aproximadamente 1863 linhas de código e 58 funções/blocos de código.

### Grupos Funcionais Identificados

#### 1. Gerenciamento de Dados
- `loadFromLocalStorage()` - Carrega dados do localStorage
- `saveToLocalStorage()` - Salva dados no localStorage
- `clearLocalStorage()` - Limpa dados do localStorage
- `attachFormListeners()` - Adiciona listeners para atualizar o localStorage

#### 2. Manipulação de Formulários
- `updateAlloyOptions()` - Atualiza opções de liga com base no fornecedor
- `updateProductDescriptions()` - Atualiza descrições de produtos
- Event listeners para os campos do formulário

#### 3. Gerenciamento de Tabelas
- `updateProductsTable()` - Atualiza a tabela de produtos
- `updatePendingRequestsTable()` - Atualiza a tabela de solicitações pendentes
- `refreshRequestsTable()` - Atualiza a tabela de solicitações

#### 4. Calendário e Datas
- `updateCalendar()` - Atualiza o calendário
- `updateDayDetails()` - Atualiza detalhes do dia selecionado
- `getProductsForDate()` - Obtém produtos para uma data específica
- `openEditDateModal()` - Abre o modal de edição de data
- `closeEditDateModal()` - Fecha o modal de edição de data
- `updateDeliveryDate()` - Atualiza a data de entrega
- `setupEditDateModalListeners()` - Configura event listeners para o modal de edição de data

#### 5. Solicitações de Compra
- `createPendingRequest()` - Cria uma solicitação pendente
- `addPurchaseRequest()` - Adiciona uma nova solicitação
- `viewRequestDetails()` - Visualiza detalhes da solicitação
- `approveRequest()` - Aprova uma solicitação
- `rejectRequest()` - Rejeita uma solicitação
- `showReviewForm()` - Mostra o formulário de revisão
- `hideReviewForm()` - Esconde o formulário de revisão
- `submitReview()` - Envia uma revisão

#### 6. Comunicação (E-mail e Impressão)
- `sendReviewEmail()` - Envia e-mail para o responsável pela revisão
- `emailRequest()` - Envia a solicitação por e-mail
- `printRequest()` - Imprime a solicitação
- `printRequestsTable()` - Imprime a tabela de solicitações

#### 7. Utilitários
- `formatMonthYear()` - Formata mês e ano
- `formatNumber()` - Formata números
- `formatDate()` - Formata data
- `showToast()` - Mostra notificações toast
- `setupTextareaCharCounter()` - Configura contador de caracteres para textarea

#### 8. UI e Interação
- Event listeners para botões e interações
- Manipulação de modais
- Gerenciamento de estados visuais

## Problemas Identificados

1. **Código monolítico**: Todas as funcionalidades estão em um único arquivo, dificultando a manutenção.
2. **Mistura de responsabilidades**: Funções de UI, lógica de negócios e manipulação de dados estão misturadas.
3. **Duplicação de código**: Existem padrões repetidos em várias partes do código.
4. **Gerenciamento de estado inconsistente**: O estado é gerenciado de forma diferente em diferentes partes do código.
5. **Tratamento de erros inconsistente**: Algumas partes têm tratamento de erros, outras não.
6. **Event listeners espalhados**: Os event listeners estão espalhados pelo código, dificultando o rastreamento.

## Plano de Refatoração

### Estrutura de Arquivos Proposta

```
/js
  /modules
    /ui
      - calendar.js (Componente de calendário)
      - modals.js (Gerenciamento de modais)
      - forms.js (Manipulação de formulários)
      - tables.js (Renderização e manipulação de tabelas)
      - notifications.js (Toasts e notificações)
    /core
      - data-manager.js (Gerenciamento de dados e localStorage)
      - request-service.js (Lógica de negócios para solicitações)
      - email-service.js (Formatação e envio de e-mails)
      - print-service.js (Funcionalidades de impressão)
    /utils
      - date-utils.js (Funções de manipulação de datas)
      - format-utils.js (Formatação de números e textos)
      - validation.js (Validação de formulários)
  - purchase_request.js (Arquivo principal, apenas para inicialização e coordenação)
```

### Próximos Passos

1. Criar os módulos utilitários (utils)
2. Criar os módulos de UI
3. Criar os módulos core
4. Reescrever o arquivo principal
5. Testar cada componente
6. Integrar e testar o sistema completo

## Mapeamento de Funções para Módulos

### utils/date-utils.js
- `formatMonthYear()`
- `formatDate()`

### utils/format-utils.js
- `formatNumber()`
- `getStatusColor()`
- `getPriorityColor()`

### utils/validation.js
- Validação de formulários (a ser extraída do código atual)

### ui/calendar.js
- `updateCalendar()`
- `updateDayDetails()`
- `getProductsForDate()`

### ui/modals.js
- `openEditDateModal()`
- `closeEditDateModal()`
- `setupEditDateModalListeners()`

### ui/forms.js
- `updateAlloyOptions()`
- `updateProductDescriptions()`
- `setupTextareaCharCounter()`

### ui/tables.js
- `updateProductsTable()`
- `updatePendingRequestsTable()`
- `refreshRequestsTable()`

### ui/notifications.js
- `showToast()`

### core/data-manager.js
- `loadFromLocalStorage()`
- `saveToLocalStorage()`
- `clearLocalStorage()`
- `attachFormListeners()`

### core/request-service.js
- `createPendingRequest()`
- `addPurchaseRequest()`
- `viewRequestDetails()`
- `approveRequest()`
- `rejectRequest()`
- `submitReview()`
- `updateDeliveryDate()`

### core/email-service.js
- `sendReviewEmail()`
- `emailRequest()`

### core/print-service.js
- `printRequest()`
- `printRequestsTable()`
