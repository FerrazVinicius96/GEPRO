import React from 'react';
import { AlertTriangle, Code } from 'lucide-react';

/**
 * Exibe uma barra e um selo visual em ambientes de homologação (localhost / IP .83).
 * Em produção (IP .80) não renderiza nada.
 */
const EnvironmentBadge = () => {
  const currentHost = window.location.hostname;

  const isTestEnvironment = currentHost === '100.67.80.83' || currentHost === 'localhost';

  if (!isTestEnvironment) return null;

  return (
    <>
      {/* Barra Global no Topo */}
      <div className="fixed top-0 left-0 w-full z-[9999] bg-yellow-400 text-yellow-900 py-1 text-center font-bold text-[11px] tracking-widest uppercase shadow-md flex items-center justify-center pointer-events-none opacity-90">
        <AlertTriangle className="w-3 h-3 mr-2" />
        Atenção: Ambiente de Homologação — Dados fictícios. Não afeta a Produção.
        <AlertTriangle className="w-3 h-3 ml-2" />
      </div>

      {/* Selo Flutuante no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-[9998] bg-gray-900 bg-opacity-80 backdrop-blur-sm text-yellow-400 border border-yellow-500 px-4 py-2 rounded-full shadow-2xl flex items-center pointer-events-none animate-pulse">
        <Code className="w-5 h-5 mr-2" />
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs leading-tight">HOMOLOGAÇÃO</span>
          <span className="text-[9px] text-gray-300 leading-tight">IP: {currentHost}</span>
        </div>
      </div>

      {/* Borda amarela sutil ao redor de toda a tela */}
      <div className="fixed inset-0 border-4 border-yellow-400 pointer-events-none z-[9997] opacity-20"></div>
    </>
  );
};

export default EnvironmentBadge;
