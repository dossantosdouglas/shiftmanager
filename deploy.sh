#!/bin/bash

# Script para deploy no EC2 com PostgreSQL
# Execute este script no seu servidor EC2

# Atualizar o sistema
echo "Atualizando o sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
echo "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gerenciar a aplicação
echo "Instalando PM2..."
sudo npm install -g pm2

# Instalar Docker
echo "Instalando Docker..."
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
echo "Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clonar o repositório
echo "Clonando o repositório..."
git clone https://github.com/dossantosdouglas/shiftmanager.git
cd shiftmanager

# Configurar ambiente
echo "Configurando ambiente..."
cp .env.example .env

# Subir PostgreSQL com Docker
echo "Iniciando PostgreSQL..."
docker-compose up -d

# Aguardar PostgreSQL iniciar
echo "Aguardando PostgreSQL inicializar..."
sleep 30

# Instalar dependências
echo "Instalando dependências..."
npm install

# Gerar Prisma Client
echo "Gerando Prisma Client..."
npx prisma generate

# Executar migrações
echo "Executando migrações..."
npx prisma migrate deploy

# Fazer seed do banco (opcional)
echo "Fazendo seed do banco..."
npx prisma db seed || echo "Seed não configurado, continuando..."

# Build da aplicação
echo "Fazendo build da aplicação..."
npm run build

# Configurar PM2
echo "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'shiftmanage',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/shiftmanager',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    instances: 1,
    exec_mode: 'fork'
  }]
}
EOF

# Iniciar aplicação com PM2
echo "Iniciando aplicação..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Deploy concluído!"
echo "PostgreSQL rodando na porta 5432"
echo "Aplicação rodando na porta 3000"
echo ""
echo "Comandos úteis:"
echo "pm2 status - Ver status da aplicação"
echo "pm2 logs - Ver logs"
echo "pm2 restart shiftmanage - Reiniciar aplicação"
echo "docker-compose logs postgres - Ver logs do PostgreSQL"