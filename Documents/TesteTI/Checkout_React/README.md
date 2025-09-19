# Nova Concursos - Sistema de Checkout

Sistema completo de e-commerce para cursos online da Nova Concursos, desenvolvido com React + TypeScript no frontend e Node.js + Express + MySQL no backend.

## 🚀 Funcionalidades

- **Catálogo de Produtos**: Visualização e gerenciamento de cursos
- **Carrinho de Compras**: Adicionar/remover produtos, controle de estoque
- **Checkout Completo**: Dados do cliente, endereço e pagamento
- **Painel Administrativo**: CRUD de produtos e visualização de pedidos
- **Banco de Dados Real**: MySQL com persistência de dados
- **APIs REST**: Backend completo com Node.js e Express

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **MySQL** (versão 8.0 ou superior)
- **Git** (para clonar o repositório)

## 🛠️ Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <url-do-seu-repositorio>
cd novo-checkout
```

### 2. Instale as Dependências

```bash
npm run setup
```

### 3. Configure o Banco de Dados

#### Opção A: Configuração Manual

1. Instale o MySQL
2. Crie o banco de dados:

```sql
CREATE DATABASE checkout_nova_concursos;
```

3. Configure as variáveis de ambiente:

```bash
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações
```

#### Opção B: Usando Docker (Recomendado)

```bash
docker-compose up -d
```

### 4. Inicialize o Banco de Dados

```bash
npm run init-db
```

### 5. Execute o Projeto

```bash
npm run dev
```

## 🌐 Acessos

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📁 Estrutura do Projeto

```
novo-checkout/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configurações do banco
│   ├── services/           # Lógica de negócio
│   ├── scripts/            # Scripts de inicialização
│   └── server.js           # Servidor principal
├── components/             # Componentes React
├── services/               # APIs do frontend
├── types.ts               # Tipos TypeScript
└── README.md              # Este arquivo
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa frontend e backend em modo desenvolvimento
- `npm run build` - Gera build de produção do frontend
- `npm run setup` - Instala todas as dependências
- `npm run init-db` - Inicializa o banco de dados
- `npm run start` - Executa em modo produção

## 🗄️ Banco de Dados

### Tabelas Principais

- **products**: Catálogo de cursos
- **orders**: Pedidos realizados
- **order_items**: Itens de cada pedido

### Estrutura das Tabelas

```sql
-- Produtos
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  image VARCHAR(500),
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE orders (
  id VARCHAR(100) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_cpf VARCHAR(20),
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(255),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(10) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'approved', 'failed') NOT NULL DEFAULT 'pending',
  payment_method ENUM('card', 'pix') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Itens do Pedido
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## Comportamento na Inicialização

Ao iniciar o backend, o script de inicialização (`backend/scripts/initDatabase.js`) garante que as tabelas existam e também verifica se existe pelo menos um pedido com status `pending`.

- Se não houver nenhum pedido com status `pending`, o sistema insere automaticamente um pedido de exemplo com status `pending` para facilitar testes e aprovação/recusa pelo painel administrativo.
- Esse pedido inicial referencia o primeiro produto existente e pode ser atualizado ou removido pelo painel.

Você pode desativar esse comportamento editando `backend/scripts/initDatabase.js` caso prefira controlar a criação de dados manualmente.

## 🔌 APIs Disponíveis

### Produtos

- `GET /api/products` - Listar todos os produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar novo produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `POST /api/products/update-stock` - Atualizar estoque

### Pedidos

- `GET /api/orders` - Listar todos os pedidos
- `GET /api/orders/:id` - Buscar pedido por ID
- `POST /api/orders` - Criar novo pedido
- `PUT /api/orders/:id/status` - Atualizar status do pedido

## 🐳 Docker (Opcional)

Para facilitar o deploy, incluímos configuração Docker:

```bash
# Subir apenas o banco de dados
docker-compose up -d mysql

# Subir toda a aplicação
docker-compose up -d
```

## 🚀 Deploy

### Deploy Manual

1. Configure um servidor com Node.js e MySQL
2. Clone o repositório
3. Execute `npm run setup`
4. Configure as variáveis de ambiente
5. Execute `npm run init-db`
6. Execute `npm run build` e `npm run start`

### Deploy com Docker

1. Configure um servidor com Docker
2. Clone o repositório
3. Execute `docker-compose up -d`

## 🐛 Solução de Problemas

### Erro de Conexão com o Banco

- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u root -p`

### Erro de CORS

- Verifique se a URL do frontend está configurada no `CORS_ORIGIN`
- Confirme se o backend está rodando na porta 3001

### Erro de Dependências

- Execute `npm run setup` para reinstalar todas as dependências
- Verifique se está usando Node.js 18+

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.
