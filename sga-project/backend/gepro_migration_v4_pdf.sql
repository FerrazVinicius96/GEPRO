-- =============================================
-- GEPRO Migration v4: Campos para geração de PDF
-- Data: 2026-05-15
-- Execução: psql -U postgres -d sga_db -f gepro_migration_v4_pdf.sql
-- =============================================

-- 1. Adicionar campos na tabela de Termo de Referência
ALTER TABLE gepro.termo_referencia
    ADD COLUMN IF NOT EXISTS orgaos_participantes TEXT,
    ADD COLUMN IF NOT EXISTS enderecos_entrega TEXT,
    ADD COLUMN IF NOT EXISTS requisitos_prova_conceito TEXT;

-- 2. Atualizar Template TR para versão 3.0 contemplando os novos campos
INSERT INTO gepro.template_tr (versao, data_publicacao, json_schema, ativo)
SELECT '3.0', '2026-05-15', '{
  "versao": "3.0",
  "campos": [
    { "nome": "objeto",                 "tipo": "text",   "obrigatorio": true, "min_length": 30 },
    { "nome": "justificativa",          "tipo": "text",   "obrigatorio": true, "min_length": 50 },
    { "nome": "prazo_entrega_dias_max", "tipo": "number", "obrigatorio": true                   },
    { "nome": "criterio_selecao",       "tipo": "text",   "obrigatorio": true                   },
    { "nome": "condicoes_pagamento",    "tipo": "text",   "obrigatorio": true                   },
    { "nome": "modelo_execucao_objeto", "tipo": "text",   "obrigatorio": true                   },
    { "nome": "modelo_gestao_contrato", "tipo": "text",   "obrigatorio": true                   },
    { "nome": "criterios_medicao_pagamento", "tipo": "text", "obrigatorio": true                },
    { "nome": "orgaos_participantes",   "tipo": "text",   "obrigatorio": true                   },
    { "nome": "enderecos_entrega",      "tipo": "text",   "obrigatorio": true                   },
    { "nome": "requisitos_prova_conceito", "tipo": "text", "obrigatorio": false                 }
  ]
}'::JSONB, TRUE
WHERE NOT EXISTS (SELECT 1 FROM gepro.template_tr WHERE versao = '3.0');

-- Desativar template antigo do TR
UPDATE gepro.template_tr SET ativo = FALSE WHERE versao = '2.0' OR versao = '1.0';
