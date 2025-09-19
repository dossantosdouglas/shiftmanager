#!/bin/bash

# Script para deploy no EC2
# Execute este script no seu servidor EC2

# Atualizar o sistema
echo "Atualizando o sistema..."
sudo apt update && sudo apt upgrade -y

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

# Clonar o repositório (ajuste a URL conforme necessário)
echo "Clonando o repositório..."
git clone https://github.com/dossantosdouglas/shiftmanager.git
cd shiftmanager

# Criar arquivo .env para produção
echo "Criando arquivo .env..."
cat > .env << EOF
DATABASE_URL="file:./dev.db"
NODE_ENV=production
EOF

# Construir e executar
echo "Construindo e executando a aplicação..."
docker-compose up -d

# Executar migrações do Prisma
echo "Executando migrações do banco de dados..."
docker-compose exec shiftmanage npx prisma migrate deploy

echo "Deploy concluído!"
echo "A aplicação está rodando em http://localhost:3000"
echo "Para ver os logs: docker-compose logs -f"
echo "Para parar: docker-compose down"