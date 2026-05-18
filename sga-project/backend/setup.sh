#!/bin/bash
# =============================================================
# SGA - Script de setup para ambiente local de estudo
# Pré-requisito: PostgreSQL instalado e rodando
# =============================================================

set -e

# Lê variáveis do .env
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_NAME="sga_homolog_db"
DB_USER="${PGUSER:-postgres}"
export PGPASSWORD="${PGPASSWORD:-Dm45d38($)}"

PSQL="C:/Program Files/PostgreSQL/18/bin/psql.exe"

echo ""
echo "======================================"
echo "  SGA - Setup do banco de dados local"
echo "======================================"
echo ""

# 1. Cria o banco se não existir
echo "[1/3] Criando banco de dados '$DB_NAME' (se não existir)..."
"$PSQL" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null && \
  echo "      Banco criado com sucesso." || \
  echo "      Banco já existe, continuando..."

# 2. Aplica schemas, migrations e seeds em ordem
echo "[2/3] Aplicando schemas, migrations e seeds..."

apply_sql() {
  local file="$1"
  local label="$2"
  if [ -f "$file" ]; then
    printf "      %s... " "$label"
    "$PSQL" -U "$DB_USER" -d "$DB_NAME" -f "$file" -q
    echo "ok."
  else
    echo "      [AVISO] $file não encontrado — pulando."
  fi
}

apply_sql "schema.sql"                    "Schema SGA (tabelas e seed do admin)"
apply_sql "gepro_schema.sql"              "Schema GEPRO (tabelas base)"
apply_sql "gepro_migration_v2.sql"        "Migration GEPRO v2 (constraints, novos módulos, templates)"
apply_sql "gepro_seed.sql"                "Seed GEPRO (50 demandas de demonstração)"
apply_sql "gepro_migration_v3_lei14133.sql" "Migration GEPRO v3 (Lei 14.133/2021)"
apply_sql "gepro_migration_v4_pdf.sql"    "Migration GEPRO v4 (campos PDF)"

# 3. Resultado
echo ""
echo "[3/3] Setup concluído!"
echo ""
echo "--------------------------------------"
echo "  Credenciais do admin padrão:"
echo "  Usuário : admin"
echo "  Senha   : Admin@123"
echo "--------------------------------------"
echo ""
echo "  Para iniciar o backend:"
echo "    npm start"
echo ""
echo "  Para iniciar o frontend (outra aba):"
echo "    cd ../frontend && npm start"
echo ""
echo "  Acesse: http://localhost:3000"
echo "======================================"
echo ""
