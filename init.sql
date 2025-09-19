-- Arquivo de inicialização do PostgreSQL
-- Este arquivo é executado automaticamente quando o container é criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurações de timezone
SET timezone = 'America/Phoenix'; -- MST

-- Mensagem de confirmação
SELECT 'Database shiftmanage initialized successfully!' as message;