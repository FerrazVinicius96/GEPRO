import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  PieChart, 
  Users, 
  Truck, 
  Settings, 
  LogOut 
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/gepro/dashboard',      icon: <LayoutDashboard className="w-4 h-4 mr-3" /> },
  { label: 'Demandas',       path: '/gepro/demandas',       icon: <FileText className="w-4 h-4 mr-3" /> },
  { label: 'Meus Processos', path: '/gepro/meus-processos', icon: <ClipboardList className="w-4 h-4 mr-3" /> },
  { label: 'Relatórios',     path: '/gepro/relatorios',     icon: <PieChart className="w-4 h-4 mr-3" /> },
];

const ADMIN_NAV_ITEMS = [
  { label: 'Usuários',      path: '/gepro/usuarios',      icon: <Users className="w-4 h-4 mr-3" /> },
  { label: 'Fornecedores',  path: '/gepro/fornecedores',  icon: <Truck className="w-4 h-4 mr-3" /> },
  { label: 'Configurações', path: '/gepro/configuracoes', icon: <Settings className="w-4 h-4 mr-3" /> },
];

export default function GEPROLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white fixed h-screen flex flex-col z-50 shadow-xl border-r border-slate-800">
        
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-center">
          <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
            GEPRO
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-1">
            <li className="px-6 py-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Menu Principal
            </li>
            
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) => `
                    flex items-center px-6 py-3 text-sm transition-all duration-200 border-l-4
                    ${isActive 
                      ? 'bg-slate-800 border-emerald-500 text-white font-semibold shadow-inner' 
                      : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-600'}
                  `}
                >
                  {icon}
                  {label}
                </NavLink>
              </li>
            ))}

            {user?.role === 'admin' && (
              <>
                <li className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider mt-4 border-t border-slate-800">
                  Administração
                </li>
                {ADMIN_NAV_ITEMS.map(({ label, path, icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      className={({ isActive }) => `
                        flex items-center px-6 py-3 text-sm transition-all duration-200 border-l-4
                        ${isActive 
                          ? 'bg-slate-800 border-emerald-500 text-white font-semibold shadow-inner' 
                          : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-600'}
                      `}
                    >
                      {icon}
                      {label}
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        {/* User info + logout */}
        <div className="border-t border-slate-800 p-6 bg-slate-900/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                {(user?.full_name ?? user?.username ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user?.full_name ?? user?.username ?? 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 'Gestor/Operador'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 py-2 px-4 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-xs font-semibold border border-slate-700 mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">

        {/* Banner de ambiente (apenas em desenvolvimento) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-amber-400 text-amber-900 px-6 py-2 text-xs font-bold text-center tracking-wider border-b border-amber-500 shadow-sm z-40 sticky top-0">
            ⚠️ AMBIENTE DE HOMOLOGAÇÃO — DADOS FICTÍCIOS NÃO AFETAM A PRODUÇÃO
          </div>
        )}

        <main className="flex-1 p-8 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
