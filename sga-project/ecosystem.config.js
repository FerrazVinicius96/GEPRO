module.exports = {
  apps: [
    {
      name: 'gepro-backend',
      script: './backend/src/index.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        DATABASE_URL: 'postgres://postgres:Dm45d38($)@localhost:5432/sga_homolog_db',
        JWT_SECRET: 'minhachaveDm45d38($)banco_sga_HOMOLOGACAO',
      },
    },
    {
      name: 'gepro-frontend',
      script: './frontend/start_frontend.js',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
