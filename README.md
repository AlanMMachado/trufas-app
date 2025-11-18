# Trufas App - Gerenciamento de Vendas

Aplicativo mobile para gerenciamento de vendas de trufas e sobremesas em ambiente de rua, desenvolvido com React Native e Expo.

## Funcionalidades

### 📊 Dashboard
- KPIs financeiros em tempo real (total vendido, pendente, lucro)
- Progresso de meta diária
- Lista das últimas 10 vendas
- Acesso rápido a nova venda e nova remessa

### 📦 Remessas
- Criação de novas remessas com produtos
- Visualização de estoque disponível
- Detalhes de cada remessa com vendas realizadas
- Status de disponibilidade (Nova/Esgotada/Parcial)

### 💰 Vendas
- Registro rápido de vendas
- Seleção de produtos disponíveis
- Controle de status de pagamento (OK/PENDENTE)
- Método de pagamento opcional

### 📈 Relatórios
- Análise financeira por período (dia/semana/mês)
- Produtos mais vendidos
- Total de vendas, pendente e lucro
- Quantidade de produtos vendidos

## Tecnologias Utilizadas

- **Frontend**: React Native + Expo SDK 50 + TypeScript
- **Banco de Dados**: SQLite (expo-sqlite)
- **State Management**: React Context API + useReducer
- **Navegação**: Expo Router v3
- **UI Components**: React Native Paper (Material Design)
- **Date Handling**: date-fns
- **Storage**: AsyncStorage para configurações

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Escaneie o QR code com o app Expo Go no seu dispositivo móvel

## Estrutura do Projeto

```
src/
├── app/                    # Telas e navegação
│   ├── (tabs)/            # Telas principais com navegação por abas
│   │   ├── dashboard.tsx  # Dashboard com KPIs
│   │   ├── remessas.tsx   # Listagem de remessas
│   │   └── relatorios.tsx # Análise de relatórios
│   ├── vendas/nova.tsx    # Formulário de nova venda
│   ├── remessas/nova.tsx  # Formulário de nova remessa
│   └── remessas/[id].tsx  # Detalhes da remessa
├── components/            # Componentes reutilizáveis
├── contexts/             # Context API para state management
├── database/             # Configuração do SQLite
├── service/              # Serviços de dados
├── types/                # Tipos TypeScript
└── constants/            # Constantes e temas
```

## Fluxo de Uso

1. **Início**: O vendedor cria uma nova remessa com os produtos que levará para vender
2. **Durante as vendas**: Registra cada transação rapidamente na tela de nova venda
3. **Acompanhamento**: Acompanha o desempenho do dia através do dashboard com KPIs em tempo real
4. **Final do dia**: Verifica relatórios detalhados e gerencia dívidas pendentes

## Banco de Dados

O aplicativo utiliza SQLite com as seguintes tabelas:

- **remessas**: Controle de remessas/estoque
- **produtos**: Produtos dentro de cada remessa
- **vendas**: Registro de vendas realizadas
- **configuracoes**: Configurações do sistema (metas, custos padrão)

## Personalização

As configurações padrão podem ser ajustadas na tabela `configuracoes`:
- `meta_diaria_valor`: Meta de vendas diárias em R$ (padrão: 200.00)
- `meta_diaria_quantidade`: Meta de quantidade vendida (padrão: 50)
- `custo_padrao_trufa`: Custo padrão por trufa (padrão: 2.50)
- `custo_padrao_sobremesa`: Custo padrão por sobremesa (padrão: 5.00)

## Desenvolvimento

Para adicionar novas funcionalidades ou fazer ajustes:

1. Os serviços de dados estão em `/service/`
2. Os tipos TypeScript estão em `/types/`
3. O estado global está gerenciado em `/contexts/AppContext.tsx`
4. O banco de dados é inicializado em `/database/db.ts`

## Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades!

## Licença

Este projeto é desenvolvido para uso comercial e gerenciamento de vendas ambulantes.