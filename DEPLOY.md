# Deploy no EC2 com Docker

## Pré-requisitos

1. Instância EC2 rodando Ubuntu 20.04 ou superior
2. Porta 3000 liberada no Security Group
3. Acesso SSH à instância

## Opção 1: Deploy Automático

1. Faça upload do script `deploy.sh` para o EC2:
```bash
scp deploy.sh ubuntu@your-ec2-ip:~/
```

2. Execute o script:
```bash
ssh ubuntu@your-ec2-ip
chmod +x deploy.sh
./deploy.sh
```

## Opção 2: Deploy Manual

### 1. Conectar ao EC2
```bash
ssh ubuntu@your-ec2-ip
```

### 2. Instalar Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. Clonar o repositório
```bash
git clone https://github.com/dossantosdouglas/shiftmanager.git
cd shiftmanager
```

### 4. Configurar ambiente
```bash
# Criar arquivo .env
echo "DATABASE_URL=file:./dev.db" > .env
echo "NODE_ENV=production" >> .env
```

### 5. Executar com Docker Compose
```bash
# Construir e executar
docker-compose up -d

# Executar migrações
docker-compose exec shiftmanage npx prisma migrate deploy
```

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar aplicação
docker-compose down

# Reiniciar aplicação
docker-compose restart

# Atualizar código
git pull
docker-compose build
docker-compose up -d

# Acessar container
docker-compose exec shiftmanage sh
```

## Configuração de Domínio (Opcional)

### Com Nginx como Reverse Proxy

1. Instalar Nginx:
```bash
sudo apt install -y nginx
```

2. Configurar site:
```bash
sudo nano /etc/nginx/sites-available/shiftmanage
```

Adicione:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Ativar site:
```bash
sudo ln -s /etc/nginx/sites-available/shiftmanage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL com Let's Encrypt (Opcional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Backup do Banco de Dados

```bash
# Backup
docker-compose exec shiftmanage cp /app/prisma/dev.db /app/backup-$(date +%Y%m%d).db

# Restaurar
docker-compose exec shiftmanage cp /app/backup-YYYYMMDD.db /app/prisma/dev.db
```