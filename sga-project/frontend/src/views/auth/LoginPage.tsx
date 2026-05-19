import React, { useState } from 'react';
import { Mail, Lock, Code } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoSGA from '../../assets/images/logo-sga-azul.png';

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-sans text-gray-800">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md mx-4 sm:mx-6 md:mx-auto">
        <div className="flex justify-center mb-6">
          <img
            src={logoSGA}
            alt="Logo Prefeitura do Recife"
            className="h-40 w-auto rounded-lg shadow-md"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/150x80/007bff/ffffff?text=Logo';
            }}
          />
        </div>

        <h2 className="text-3xl font-extrabold text-center text-blue-900 mt-8 mb-8 tracking-tight">
          SGA - Sistema de Gestão de Ativos
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline-block w-4 h-4 mr-2 text-blue-600" /> Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200 ease-in-out"
              placeholder="admin@sga.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="inline-block w-4 h-4 mr-2 text-blue-600" /> Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200 ease-in-out"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition duration-300 ease-in-out transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Acesso restrito. Solicite seu cadastro via e-mail:</p>
          <a href="mailto:relacionamentosepti@educ.rec.br" className="font-medium text-blue-700 hover:text-blue-900 transition-colors duration-200">
            relacionamentosepti@educ.rec.br
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-100 text-center">
          <p className="text-xs text-gray-500 font-medium">Sistema de Gestão de Ativos (SGA)</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Idealizado e desenvolvido pela <span className="font-semibold text-gray-500">GIT - Gerência de Infraestrutura</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-center">
            <Code className="w-3 h-3 mr-1" /> Gestão: Alberto Dantas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
