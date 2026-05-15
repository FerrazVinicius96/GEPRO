import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingDown, TrendingUp, Clock, AlertOctagon, 
  CheckCircle, FileSignature, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area,
  BarChart, Bar, Cell
} from 'recharts';

// --- MOCK DATA FOR EXECUTIVE PRESENTATION ---
const economiaData = [
  { mes: 'Jan', estimado: 1500, adjudicado: 1200 },
  { mes: 'Fev', estimado: 2200, adjudicado: 1800 },
  { mes: 'Mar', estimado: 1800, adjudicado: 1450 },
  { mes: 'Abr', estimado: 3500, adjudicado: 2800 },
  { mes: 'Mai', estimado: 2900, adjudicado: 2100 },
  { mes: 'Jun', estimado: 4100, adjudicado: 3050 }
];

const gargaloData = [
  { fase: 'Necessidade', processos: 12 },
  { fase: 'Aprovação Gestor', processos: 4 },
  { fase: 'Instrução Técnica (ETP/TR)', processos: 28 },
  { fase: 'Análise Jurídica', processos: 15 },
  { fase: 'Licitação', processos: 8 }
];

export default function GEPROExecutiveDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-10 animate-fadeIn" style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Breadcrumb e Toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          <Link to="/gepro/dashboard" className="text-gray-400 hover:text-blue-600 transition-colors">← Voltar ao Operacional</Link>
          {' / '}
          <span className="text-gray-800 font-semibold">Painel Executivo C-Level</span>
        </p>
        <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
          Visão Estratégica
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center tracking-tight">
            Painel Executivo de Licitações
          </h2>
          <p className="text-gray-500 mt-2 text-sm">Monitoramento Estratégico da Lei 14.133/21 — Controladoria e Eficiência</p>
        </div>
        <button 
          onClick={() => navigate('/gepro/dashboard')}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 font-semibold text-sm transition-all"
        >
          Ver Fila Operacional
        </button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm flex flex-col justify-center transform transition-transform hover:-translate-y-1">
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" /> Economia Gerada (YTD)
          </span>
          <span className="text-4xl font-black text-green-900 mt-2">R$ 3.5M</span>
          <span className="text-sm text-green-600 font-medium mt-1">22% abaixo do valor estimado</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transform transition-transform hover:-translate-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Tempo Médio (SLA)
          </span>
          <span className="text-3xl font-black text-slate-800 mt-2">42 dias</span>
          <span className="text-sm text-blue-600 font-medium mt-1">15 dias mais rápido que 2025</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transform transition-transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full z-0"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center relative z-10">
            <AlertOctagon className="w-4 h-4 mr-1 text-red-500" /> Processos em Alerta
          </span>
          <span className="text-3xl font-black text-slate-800 mt-2 relative z-10">7</span>
          <span className="text-sm text-red-600 font-medium mt-1 relative z-10">Paralisados há &gt; 10 dias</span>
        </div>

        <div className="bg-blue-900 border border-blue-800 rounded-xl p-5 shadow-lg flex flex-col justify-center text-white transform transition-transform hover:-translate-y-1 cursor-pointer">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wide flex items-center">
            <FileSignature className="w-4 h-4 mr-1" /> Requer Sua Ação
          </span>
          <span className="text-4xl font-black mt-2">4</span>
          <span className="text-sm text-blue-200 font-medium mt-1 flex items-center">
            Demandas aguardando canetada <ArrowRight className="w-3 h-3 ml-1" />
          </span>
        </div>

      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Economia */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600"/> 
            Eficiência de Compra (Estimado vs. Realizado)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={economiaData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`R$ ${value}k`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="estimado" 
                  name="Valor Estimado (Teto)" 
                  fill="#e2e8f0" 
                  stroke="#94a3b8" 
                  strokeWidth={2} 
                />
                
                <Line 
                  type="monotone" 
                  dataKey="adjudicado" 
                  name="Valor Adjudicado (Real)" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981' }} 
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Gargalos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 text-lg flex items-center">
            <AlertOctagon className="w-5 h-5 mr-2 text-orange-500"/> 
            Mapa de Gargalos (Processos por Fase)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gargaloData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="fase" type="category" width={140} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                
                <Bar dataKey="processos" name="Volume" radius={[0, 4, 4, 0]} barSize={28}>
                  {gargaloData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.processos > 20 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            A fase de <strong>Instrução Técnica (ETP/TR)</strong> concentra atualmente 41% das demandas ativas.
          </p>
        </div>

      </div>

    </div>
  );
}
