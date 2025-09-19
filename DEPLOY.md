# Deploy no EC2 com PostgreSQL

## Pré-requisitos

1. Instância EC2 rodando Ubuntu 20.04 ou superior
2. Porta 3000 liberada no Security Group (aplicação)
3. Porta 5432 liberada no Security Group (PostgreSQL - apenas se necessário acesso externo)
4. Acesso SSH à instância

## Arquitetura

- **PostgreSQL**: Roda em container Docker
- **Aplicação Next.js**: Roda diretamente no sistema com PM2
- **Gerenciamento**: PM2 para a aplicação, Docker para o banco

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

### 2. Instalar dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Docker
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Logout e login novamente para aplicar grupo docker
```

### 3. Clonar o repositório

```bash
git clone https://github.com/dossantosdouglas/shiftmanager.git
cd shiftmanager
```

### 4. Configurar PostgreSQL

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Iniciar PostgreSQL
docker-compose up -d

# Verificar se PostgreSQL iniciou
docker-compose logs postgres
```

### 5. Configurar aplicação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Build da aplicação
npm run build
```

### 6. Iniciar com PM2

```bash
# Criar arquivo de configuração do PM2
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

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Comandos Úteis

### Aplicação (PM2)

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs shiftmanage

# Reiniciar
pm2 restart shiftmanage

# Parar
pm2 stop shiftmanage

# Remover
pm2 delete shiftmanage
```

### PostgreSQL (Docker)

```bash
# Ver logs do PostgreSQL
docker-compose logs postgres

# Parar PostgreSQL
docker-compose stop

# Iniciar PostgreSQL
docker-compose start

# Remover PostgreSQL (cuidado!)
docker-compose down -v
```

### Atualização do código

```bash
cd /home/ubuntu/shiftmanager
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart shiftmanage
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

### Backup automático

```bash
# Criar script de backup
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
docker exec shiftmanage_postgres pg_dump -U shiftmanage shiftmanage > backup_\$DATE.sql
# Manter apenas os últimos 7 backups
ls -t backup_*.sql | tail -n +8 | xargs rm -f
EOF

chmod +x backup.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/shiftmanager/backup.sh") | crontab -
```

### Backup manual

```bash
# Fazer backup
docker exec shiftmanage_postgres pg_dump -U shiftmanage shiftmanage > backup.sql

# Restaurar backup
docker exec -i shiftmanage_postgres psql -U shiftmanage -d shiftmanage < backup.sql
```

## Monitoramento

### Ver recursos do sistema

```bash
# CPU e memória
htop

# Espaço em disco
df -h

# Status dos serviços
systemctl status docker
pm2 monit
```

### Logs importantes

```bash
# Logs da aplicação
pm2 logs shiftmanage

# Logs do PostgreSQL
docker-compose logs postgres

# Logs do sistema
sudo journalctl -u docker.service
```
