# Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. Conta no GitHub
2. Conta na Vercel
3. PostgreSQL remoto configurado

## 🚀 Processo de Deploy

### 1. Preparar Repositório GitHub

```bash
# 1. Commit todas as mudanças
git add .
git commit -m "Configure for Vercel deployment with remote PostgreSQL"

# 2. Push para o GitHub
git push origin main
```

### 2. Configurar na Vercel

1. **Acesse**: [vercel.com](https://vercel.com)
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Selecione** seu repositório `shiftmanager`
5. **Configure as variáveis de ambiente**:

```
DATABASE_URL=postgresql://admin:senha123@3.22.121.135:5432/meubanco
```

### 3. Deploy Automático

- A Vercel irá fazer o build automaticamente
- Cada push no repositório criará um novo deploy
- O banco PostgreSQL já está configurado e rodando

## ⚙️ Configurações Importantes

### Variáveis de Ambiente na Vercel

Na dashboard da Vercel, vá em:
**Project Settings → Environment Variables**

Adicione:

- **Name**: `DATABASE_URL`
- **Value**: `postgresql://admin:senha123@3.22.121.135:5432/meubanco`
- **Environment**: `Production`, `Preview`, `Development`

### Build Commands (Automático)

A Vercel detecta automaticamente:

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 🔧 Comandos Locais Úteis

```bash
# Verificar conexão com banco
npx prisma db push

# Executar migrações
npx prisma migrate deploy

# Visualizar dados
npx prisma studio

# Testar build local
npm run build

# Testar produção local
npm start
```

## 📊 Monitoramento

### Na Dashboard Vercel:

- **Functions**: Ver logs das API routes
- **Analytics**: Métricas de performance
- **Domains**: Configurar domínio personalizado

### Logs da Aplicação:

```bash
# Ver logs em tempo real
vercel logs your-app-url
```

## 🚨 Troubleshooting

### Erro de Conexão com Banco:

1. Verificar se IP da Vercel está liberado no firewall
2. Confirmar credenciais do PostgreSQL
3. Testar conexão local primeiro

### Build Errors:

1. Verificar se todas as dependências estão no `package.json`
2. Confirmar que `npx prisma generate` roda sem erro
3. Verificar TypeScript errors

### Environment Variables:

1. Certificar que `DATABASE_URL` está definida
2. Verificar se variável está aplicada em todos os ambientes
3. Reiniciar deploy após mudanças

## 🎯 Resultado Final

Após o deploy bem-sucedido:

- ✅ Aplicação rodando na Vercel
- ✅ PostgreSQL remoto conectado
- ✅ Deploy automático configurado
- ✅ HTTPS por padrão
- ✅ Performance otimizada

**URL da aplicação**: `https://your-app.vercel.app`
