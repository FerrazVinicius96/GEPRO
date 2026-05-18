-- =============================================
-- GEPRO Migration v3: Adequação Lei 14.133/21
-- Data: 2026-05-15
-- Docs: analise_juridica_gepro.md
-- Execução: psql -U postgres -d sga_homolog_db -f gepro_migration_v3_lei14133.sql
-- =============================================

-- 1. Alterar Constraints de Modalidade Licitatória (Remover Convite/SRP, Adicionar Contratação Direta e Adesão ARP)
ALTER TABLE gepro.demanda DROP CONSTRAINT IF EXISTS demanda_modalidade_licitatoria_check;

-- Converter valores antigos ANTES de adicionar o novo constraint
UPDATE gepro.demanda SET modalidade_licitatoria = 'adesao_arp' WHERE modalidade_licitatoria IN ('srp', 'ata_registro_precos');
UPDATE gepro.demanda SET modalidade_licitatoria = 'dispensa'   WHERE modalidade_licitatoria = 'convite';

ALTER TABLE gepro.demanda ADD CONSTRAINT demanda_modalidade_licitatoria_check
    CHECK (modalidade_licitatoria IN ('pregao', 'concorrencia', 'concurso', 'leilao', 'dialogo_competitivo', 'dispensa', 'inexigibilidade', 'adesao_arp'));

-- 2. Adicionar campos obrigatórios no ETP (Art. 18)
ALTER TABLE gepro.etp 
    ADD COLUMN IF NOT EXISTS posicionamento_conclusivo TEXT,
    ADD COLUMN IF NOT EXISTS estimativa_quantidades TEXT,
    ADD COLUMN IF NOT EXISTS justificativa_parcelamento TEXT;

-- 3. Adicionar campos obrigatórios no TR (Art. 6)
ALTER TABLE gepro.termo_referencia
    ADD COLUMN IF NOT EXISTS modelo_execucao_objeto TEXT,
    ADD COLUMN IF NOT EXISTS modelo_gestao_contrato TEXT,
    ADD COLUMN IF NOT EXISTS criterios_medicao_pagamento TEXT;

-- 4. Alterar tabela Cotação para suportar origens diversas (PNCP, Painel de Preços) e não obrigar Fornecedor
ALTER TABLE gepro.cotacao ALTER COLUMN fornecedor_id DROP NOT NULL;
ALTER TABLE gepro.cotacao ADD COLUMN IF NOT EXISTS origem_preco VARCHAR(50) DEFAULT 'fornecedor'
    CHECK (origem_preco IN ('fornecedor', 'pncp', 'painel_precos', 'contratacao_similar', 'outro'));

-- 5. Inserir Seed V2.0 dos Templates (com os novos campos obrigatórios)
INSERT INTO gepro.template_etp (versao, data_publicacao, json_schema, ativo)
SELECT '2.0', '2026-05-15', '{
  "versao": "2.0",
  "campos": [
    { "nome": "justificativa_tecnica",  "tipo": "text",   "obrigatorio": true,  "min_length": 50 },
    { "nome": "categoria_equipamento",  "tipo": "text",   "obrigatorio": true                    },
    { "nome": "criterios_rejeicao",     "tipo": "text",   "obrigatorio": true,  "min_length": 20 },
    { "nome": "posicionamento_conclusivo", "tipo": "text", "obrigatorio": true, "min_length": 50 },
    { "nome": "estimativa_quantidades", "tipo": "text",   "obrigatorio": true                    },
    { "nome": "justificativa_parcelamento", "tipo": "text", "obrigatorio": true                  },
    { "nome": "garantia_periodo",       "tipo": "text",   "obrigatorio": false                   },
    { "nome": "suporte_tecnico",        "tipo": "text",   "obrigatorio": false                   }
  ]
}'::JSONB, TRUE
WHERE NOT EXISTS (SELECT 1 FROM gepro.template_etp WHERE versao = '2.0');

-- Desativar template antigo do ETP
UPDATE gepro.template_etp SET ativo = FALSE WHERE versao = '1.0';

INSERT INTO gepro.template_tr (versao, data_publicacao, json_schema, ativo)
SELECT '2.0', '2026-05-15', '{
  "versao": "2.0",
  "campos": [
    { "nome": "objeto",                 "tipo": "text",   "obrigatorio": true, "min_length": 30 },
    { "nome": "justificativa",          "tipo": "text",   "obrigatorio": true, "min_length": 50 },
    { "nome": "prazo_entrega_dias_max", "tipo": "number", "obrigatorio": true                   },
    { "nome": "criterio_selecao",       "tipo": "text",   "obrigatorio": true                   },
    { "nome": "condicoes_pagamento",    "tipo": "text",   "obrigatorio": true                   },
    { "nome": "modelo_execucao_objeto", "tipo": "text",   "obrigatorio": true                   },
    { "nome": "modelo_gestao_contrato", "tipo": "text",   "obrigatorio": true                   },
    { "nome": "criterios_medicao_pagamento", "tipo": "text", "obrigatorio": true                }
  ]
}'::JSONB, TRUE
WHERE NOT EXISTS (SELECT 1 FROM gepro.template_tr WHERE versao = '2.0');

-- Desativar template antigo do TR
UPDATE gepro.template_tr SET ativo = FALSE WHERE versao = '1.0';
