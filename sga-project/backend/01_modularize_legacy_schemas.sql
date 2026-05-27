-- =========================================================================
-- MIGRATION SCRIPT: Modularize Legacy Schemas
-- File: 01_modularize_legacy_schemas.sql
-- Goal: Create identity and sga schemas and move legacy public tables.
-- =========================================================================

-- 1. Create the new schemas if they do not exist
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS sga;

-- 2. Move tables to identity schema (Core Compartilhado)
ALTER TABLE IF EXISTS public.units SET SCHEMA identity;
ALTER TABLE IF EXISTS public.users SET SCHEMA identity;
ALTER TABLE IF EXISTS public.people SET SCHEMA identity;
ALTER TABLE IF EXISTS public.audit_logs SET SCHEMA identity;

-- 3. Move tables to sga schema (Ativos e Logística Escolar)
ALTER TABLE IF EXISTS public.item_types SET SCHEMA sga;
ALTER TABLE IF EXISTS public.assets SET SCHEMA sga;
ALTER TABLE IF EXISTS public.asset_movements SET SCHEMA sga;
ALTER TABLE IF EXISTS public.movement_assets SET SCHEMA sga;
ALTER TABLE IF EXISTS public.movement_peripherals SET SCHEMA sga;
ALTER TABLE IF EXISTS public.tablet_eligible_students SET SCHEMA sga;
ALTER TABLE IF EXISTS public.delivery_batches SET SCHEMA sga;
ALTER TABLE IF EXISTS public.delivery_batch_items SET SCHEMA sga;
ALTER TABLE IF EXISTS public.delivery_batch_contacts SET SCHEMA sga;
ALTER TABLE IF EXISTS public.retirement_requests SET SCHEMA sga;
ALTER TABLE IF EXISTS public.collection_orders SET SCHEMA sga;
ALTER TABLE IF EXISTS public.pending_substitutions SET SCHEMA sga;
ALTER TABLE IF EXISTS public.tablet_substitutions_log SET SCHEMA sga;

-- =========================================================================
-- CONFIRMAÇÃO DE INTEGRIDADE DAS CHAVES ESTRANGEIRAS (FKs)
-- =========================================================================
-- NOTA: O PostgreSQL gerencia internamente e atualiza automaticamente os
-- ponteiros de chaves estrangeiras (FKs) ao alterar o schema de tabelas via 
-- 'SET SCHEMA'. Desse modo, quaisquer referências de FKs oriundas do schema 
-- 'gepro' (como gepro.demanda apontando para users) ou referências cruzadas 
-- entre tabelas migradas (como assets referenciando item_types ou units) 
-- permanecerão perfeitamente íntegras e válidas após a execução deste script.
-- =========================================================================

-- =========================================================================
-- AVISO CRÍTICO DE CONFIGURAÇÃO DE BACKEND (Node.js/pg)
-- =========================================================================
-- ATENÇÃO, DESENVOLVEDOR BACKEND:
-- A partir da aplicação desta migração, as tabelas não residem mais no 
-- schema 'public'. Para garantir o correto funcionamento das consultas 
-- nativas do Node.js, execute a configuração do search_path logo após a 
-- abertura de cada conexão com o banco de dados:
--
--    SET search_path TO gepro, sga, identity, public;
--
-- Ou certifique-se de referenciar explicitamente as tabelas em suas queries
-- usando a notação do schema (ex: identity.users, sga.assets, gepro.demanda).
-- =========================================================================
