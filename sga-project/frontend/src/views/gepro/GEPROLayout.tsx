import React, { useState } from 'react';
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
  LogOut,
  Menu,
  UserCircle,
  Code
} from 'lucide-react';
import logoSGA from '../../assets/images/logo-sga-azul.png';

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/gepro/dashboard',      icon: LayoutDashboard },
  { label: 'Demandas',       path: '/gepro/demandas',       icon: FileText },
  { label: 'Meus Processos', path: '/gepro/meus-processos', icon: ClipboardList },
  { label: 'Relatórios',     path: '/gepro/relatorios',     icon: PieChart },
];

const ADMIN_NAV_ITEMS = [
  { label: 'Usuários',      path: '/gepro/usuarios',      icon: Users },
  { label: 'Fornecedores',  path: '/gepro/fornecedores',  icon: Truck },
  { label: 'Configurações', path: '/gepro/configuracoes', icon: Settings },
];

export default function GEPROLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      
      {/* Sidebar - Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* SIDEBAR */}
      <div className={`fixed top-0 left-0 h-full bg-blue-900 text-white w-64 p-5 z-50 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="#dashboard"
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              navigate('/gepro/dashboard');
              setSidebarOpen(false);
            }}
          >
            <img
              src={logoSGA}
              alt="Logo Prefeitura"
              className="h-38 w-auto"
            />
          </a>
        </div>

        {/* Nav items */}
        <nav className="space-y-2 flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-track-blue-900 scrollbar-thumb-blue-700 hover:scrollbar-thumb-blue-500 scrollbar-thumb-rounded-full">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center p-3 rounded-lg transition-colors duration-200 
                ${isActive ? 'bg-blue-700 text-yellow-300 shadow-md' : 'hover:bg-blue-800'}
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-bold uppercase text-blue-400 tracking-wider px-3">
                  Administração
                </p>
              </div>
              {ADMIN_NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg transition-colors duration-200 
                    ${isActive ? 'bg-blue-700 text-yellow-300 shadow-md' : 'hover:bg-blue-800'}
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-red-700 text-red-300 mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </nav>

        {/* Footer Signature */}
        <div className="mt-auto pt-4 border-t border-blue-800 pb-2">
          <p className="text-[10px] text-blue-300 text-center leading-tight">
            Desenvolvido pela <br/>
            <span className="font-semibold text-blue-100">GIT - Gerência de Infraestrutura</span>
          </p>
          <p className="text-[10px] text-blue-400 text-center mt-1 flex items-center justify-center">
            <Code className="w-3 h-3 mr-1" /> Gestão: Alberto Dantas
          </p>
          <p className="text-[9px] text-blue-500 text-center mt-2">Versão 1.0.0 • 2026</p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300 ease-in-out">
        
        {/* Banner de ambiente */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-amber-400 text-amber-900 px-6 py-2 text-xs font-bold text-center tracking-wider border-b border-amber-500 shadow-sm">
            ⚠️ AMBIENTE DE HOMOLOGAÇÃO — DADOS FICTÍCIOS NÃO AFETAM A PRODUÇÃO
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:justify-end">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-blue-800 focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative">
            <button onClick={() => setHeaderMenuOpen(p => !p)} className="flex items-center space-x-2 cursor-pointer">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-medium text-gray-700">{user?.full_name || user?.username}</span>
                <span className="block text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Gestor/Operador'}</span>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">
                {(user?.username?.charAt(0).toUpperCase() || 'U')}
              </div>
            </button>

            {headerMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border"
                onMouseLeave={() => setHeaderMenuOpen(false)}
              >
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <UserCircle className="w-4 h-4 mr-2" /> Meu Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
