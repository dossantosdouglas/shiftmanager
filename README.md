# Shift Management System

Sistema de gerenciamento de turnos com Next.js 15, PostgreSQL e Prisma.

## 🚀 Deploy na Vercel

### 1. Fork o repositório no GitHub

### 2. Configurar variáveis de ambiente na Vercel:
```
DATABASE_URL=postgresql://admin:senha123@3.22.121.135:5432/meubanco
```

### 3. Deploy automático
- Conecte seu repositório GitHub na Vercel
- O deploy será automático a cada push

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 20+

### Setup
```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env

# 3. Configurar banco (primeira vez)
npx prisma migrate dev
npx prisma generate

# 4. Executar aplicação
npm run dev
```

## 📊 Funcionalidades

- ✅ Autenticação (Funcionário/Admin)
- ✅ Registro de turnos (Cancelar/Modificar/Adicionar)
- ✅ Confirmação de turnos (Admin)
- ✅ Relatórios (Admin)
- ✅ Tema claro/escuro
- ✅ Interface responsiva

## 🔧 Stack Tecnológica

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Banco**: PostgreSQL (Remoto)
- **ORM**: Prisma
- **UI**: shadcn/ui, Tailwind CSS
- **Deploy**: Vercel

## 📝 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Reset do banco (dev)
npx prisma migrate reset

# Visualizar banco
npx prisma studio

# Build para produção
npm run build
npm start
```

## 🗄️ Configuração do Banco

O sistema está configurado para usar PostgreSQL remoto:
- **Host**: 3.22.121.135
- **Porta**: 5432
- **Usuário**: admin
- **Senha**: senha123
- **Database**: meubanco