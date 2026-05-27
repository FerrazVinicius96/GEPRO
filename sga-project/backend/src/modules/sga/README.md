# Módulo SGA (Ativos - Legado)

Este módulo representa o desacoplamento e isolamento do domínio de gerenciamento de ativos herdado do SGA.

## Objetivo
Manter este módulo separado dos domínios `identity` e `gepro` para garantir que futuras refatorações no sistema legado não impactem os novos módulos do ecossistema.

## Estrutura Física Recomendada
Quando novas funcionalidades de Ativos forem migradas para o monolito modular, devem seguir a seguinte organização:
- `routes/`: Endpoints de ativos (ex: `/api/assets`)
- `controllers/`: Recebimento de requisições de ativos
- `services/`: Validação técnica de movimentações e incorporação de ativos
- `repositories/`: Queries parametrizadas em SQL puro para tabelas do schema `sga`

> [!NOTE]
> Por design, as tabelas e queries de leitura de ativos no banco PostgreSQL podem ser acessadas pelo schema público, mas a lógica de gravação e alteração de ativos deve ser isolada estritamente dentro deste diretório de repositório.
