// SGA - Setup do banco de dados local
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'sga_homolog_db';
const baseUrl = process.env.DATABASE_URL.replace(`/${DB_NAME}`, '/postgres');

// Arquivos SQL a aplicar, em ordem. O seed do GEPRO deve vir após a migration v2
// (que corrige o CHECK constraint de status para incluir agendamento_*),
// e antes da v3 (que converte modalidades antigas para os valores da Lei 14.133).
const SQL_FILES = [
  { file: 'schema.sql',                    label: 'Schema SGA (tabelas e seed do admin)' },
  { file: 'gepro_schema.sql',              label: 'Schema GEPRO (tabelas base)'          },
  { file: 'gepro_migration_v2.sql',        label: 'Migration GEPRO v2 (constraints, novos módulos, templates)' },
  { file: 'gepro_seed.sql',                label: 'Seed GEPRO (50 demandas de demonstração)' },
  { file: 'gepro_migration_v3_lei14133.sql', label: 'Migration GEPRO v3 (Lei 14.133/2021)' },
  { file: 'gepro_migration_v4_pdf.sql',    label: 'Migration GEPRO v4 (campos PDF)'      },
];

async function setup() {
  console.log('\n======================================');
  console.log('  SGA/GEPRO - Setup do banco de dados');
  console.log('======================================\n');

  // 1. Conecta ao banco padrão (postgres) para criar o sga_homolog_db
  const admin = new Client({ connectionString: baseUrl });
  await admin.connect();

  process.stdout.write('[1/3] Criando banco de dados "sga_homolog_db" (se não existir)... ');
  try {
    await admin.query(`CREATE DATABASE ${DB_NAME}`);
    console.log('criado.');
  } catch (e) {
    if (e.code === '42P04') console.log('já existe, continuando.');
    else throw e;
  }
  await admin.end();

  // 2. Conecta ao sga_homolog_db e aplica todos os schemas/migrations/seeds
  console.log('[2/3] Aplicando schemas, migrations e seeds...');
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  for (const { file, label } of SQL_FILES) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`      [AVISO] ${file} não encontrado — pulando.`);
      continue;
    }
    process.stdout.write(`      ${label}... `);
    const sql = fs.readFileSync(filePath, 'utf8');
    await db.query(sql);
    console.log('ok.');
  }

  await db.end();

  // 3. Resultado
  console.log('\n[3/3] Setup concluído!');
  console.log('\n--------------------------------------');
  console.log('  Credenciais do admin padrão:');
  console.log('  Usuário : admin');
  console.log('  Senha   : Admin@123');
  console.log('--------------------------------------');
  console.log('\n  Para iniciar o backend:');
  console.log('    npm start');
  console.log('\n  Para iniciar o frontend (outra aba):');
  console.log('    cd ../frontend && npm start');
  console.log('\n  Acesse: http://localhost:3000');
  console.log('======================================\n');
}

setup().catch(err => {
  console.error('\n[ERRO]', err.message);
  process.exit(1);
});
