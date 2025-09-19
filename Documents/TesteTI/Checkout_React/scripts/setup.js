#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando configuração do Nova Concursos Checkout...\n');

// Verificar se Node.js está instalado
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js ${nodeVersion} encontrado`);
} catch (error) {
  console.error('❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro.');
  process.exit(1);
}

// Verificar se MySQL está instalado
try {
  execSync('mysql --version', { encoding: 'utf8' });
  console.log('✅ MySQL encontrado');
} catch (error) {
  console.log('⚠️  MySQL não encontrado. Você precisará instalá-lo manualmente.');
  console.log('   Instruções: https://dev.mysql.com/downloads/installer/');
}

// Instalar dependências do frontend
console.log('\n📦 Instalando dependências do frontend...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências do frontend instaladas');
} catch (error) {
  console.error('❌ Erro ao instalar dependências do frontend:', error.message);
  process.exit(1);
}

// Instalar dependências do backend
console.log('\n📦 Instalando dependências do backend...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Dependências do backend instaladas');
} catch (error) {
  console.error('❌ Erro ao instalar dependências do backend:', error.message);
  process.exit(1);
}

// Criar arquivo .env se não existir
const envPath = path.join('backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚙️  Criando arquivo de configuração...');
  const envContent = `# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=checkout_nova_concursos

# Configurações do Servidor
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado');
  console.log('⚠️  Lembre-se de configurar a senha do MySQL no arquivo backend/.env');
}

console.log('\n🎉 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure o MySQL e crie o banco de dados:');
console.log('   mysql -u root -p');
console.log('   CREATE DATABASE checkout_nova_concursos;');
console.log('2. Configure a senha do MySQL no arquivo backend/.env');
console.log('3. Inicialize o banco de dados:');
console.log('   npm run init-db');
console.log('4. Execute o projeto:');
console.log('   npm run dev');
console.log('\n🌐 URLs:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:3001');
console.log('   API Health: http://localhost:3001/api/health');
