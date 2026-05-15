import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, ClipboardList, LogOut } from 'lucide-react';

export default function ModuleChooser() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-screen flex flex-col items-center justify-center z-50 shadow-2xl">
        <div className="text-center mb-12">
          <div className="text-4xl font-extrabold tracking-widest mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            SGA
          </div>
          <div className="text-xs text-slate-400 tracking-widest font-semibold uppercase">
            Sistema de Gestão
          </div>
        </div>

        <div className="absolute bottom-8 text-center w-full px-6">
          <div className="text-sm text-slate-300 mb-4 font-medium truncate">
            {user?.full_name ?? user?.username}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 py-2 px-4 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-semibold border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col relative">
        {/* Header Alert (Homologação) */}
        {process.env.NODE_ENV !== 'production' && (
          <header className="fixed top-0 left-64 right-0 h-12 bg-amber-400 flex items-center justify-center z-40 text-xs font-bold text-amber-900 border-b border-amber-500 shadow-sm tracking-wide">
            ⚠️ ATENÇÃO: AMBIENTE DE HOMOLOGAÇÃO — DADOS FICTÍCIOS. NÃO AFETA A PRODUÇÃO.
          </header>
        )}

        <div className={`flex-1 flex items-center justify-center p-12 ${process.env.NODE_ENV !== 'production' ? 'mt-12' : ''}`}>
          <div className="max-w-4xl w-full text-center animate-fadeIn">
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Bem-vindo ao Sistema de Gestão
            </h1>
            <p className="text-lg text-slate-500 mb-12 font-medium">
              Escolha o módulo que deseja acessar para iniciar sua sessão.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* Card SGA */}
              <div
                onClick={() => navigate('/dashboard')}
                className="group bg-white rounded-2xl p-10 cursor-pointer border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">SGA</h2>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Gestão de Ativos</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Rastreie patrimônio, gerencie movimentações, estoques e mantenha o histórico completo dos ativos físicos.
                </p>
                <button className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  Acessar Módulo
                </button>
              </div>

              {/* Card GEPRO */}
              <div
                onClick={() => navigate('/gepro/dashboard')}
                className="group bg-white rounded-2xl p-10 cursor-pointer border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">GEPRO</h2>
                <h3 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-4">Gestão de Aquisições</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Acompanhe processos licitatórios desde a necessidade até a entrega oficial, conforme a Lei 14.133/2021.
                </p>
                <button className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  Acessar Módulo
                </button>
              </div>

            </div>

            <div className="pt-8 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Lei 14.133/2021 • Sistema de Gestão Governamental • v2.0
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
