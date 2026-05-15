import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, DollarSign, Clock, Bell, Plus, LayoutDashboard, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import * as geproService from '../../services/geproService';

// ── helpers ───────────────────────────────────────────────────

const MODALIDADES = [
  { value: 'pregao',             label: 'Pregão' },
  { value: 'concorrencia',       label: 'Concorrência' },
  { value: 'srp',                label: 'SRP' },
  { value: 'convite',            label: 'Convite' },
  { value: 'ata_registro_precos',label: 'Ata de Registro de Preços' },
];

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function fmtCompact(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$ ${Math.round(v / 1_000)}K`;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function daysBadge(d: number): { text: string; bg: string; color: string } {
  if (d <= 0) return { text: 'hoje', bg: 'bg-red-100', color: 'text-red-700' };
  if (d <= 3) return { text: `${d}d`, bg: 'bg-amber-100', color: 'text-amber-700' };
  if (d <= 7) return { text: `${d}d`, bg: 'bg-amber-100', color: 'text-amber-700' };
  return { text: `${d}d`, bg: 'bg-blue-100', color: 'text-blue-700' };
}

function phaseLabel(status: string) {
  if (status.startsWith('necessidade'))    return 'Necessidade';
  if (status.startsWith('instrucao'))      return 'Instrução Técnica';
  if (status.startsWith('encaminhamento')) return 'Encaminhamento';
  if (status.startsWith('agendamento') || status.startsWith('recebimento')) return 'Recebimento';
  return 'Encerramento';
}

function activityMeta(status: string): { bg: string; color: string; icon: string; title: string } {
  if (status === 'necessidade_rascunho')         return { bg: 'bg-green-100', color: 'text-green-700', icon: '+', title: 'Nova demanda cadastrada' };
  if (status === 'necessidade_aprovada')         return { bg: 'bg-blue-100', color: 'text-blue-700', icon: '✓', title: 'Aprovação recebida' };
  if (status.startsWith('instrucao'))            return { bg: 'bg-blue-100', color: 'text-blue-700', icon: '✎', title: 'Instrução técnica em andamento' };
  if (status.startsWith('encaminhamento'))       return { bg: 'bg-amber-100', color: 'text-amber-700', icon: '→', title: 'Encaminhado para NE' };
  if (status.startsWith('agendamento') || status.startsWith('recebimento')) return { bg: 'bg-pink-100', color: 'text-pink-700', icon: '⊞', title: 'Em recebimento' };
  return { bg: 'bg-emerald-100', color: 'text-emerald-700', icon: '★', title: 'Processo encerrado' };
}

// ── NovaDemandaModal ──────────────────────────────────────────

const FORM_EMPTY = { titulo: '', descricao: '', tipo_equipamento: '', quantidade: '', valor_estimado: '', modalidade_licitatoria: '', setor_solicitante: '', data_necessidade_prevista: '', aquisicao_emergencial: false, justificativa_emergencial: '' };

function NovaDemandaModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>(FORM_EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.titulo.trim())                                         { setError('Título é obrigatório.'); return; }
    if (form.descricao.trim().length < 50)                           { setError(`Descrição muito curta: ${form.descricao.trim().length}/50 caracteres.`); return; }
    if (!form.tipo_equipamento.trim())                               { setError('Tipo de equipamento é obrigatório.'); return; }
    if (!form.quantidade || Number(form.quantidade) <= 0)            { setError('Quantidade deve ser maior que zero.'); return; }
    if (!form.valor_estimado || Number(form.valor_estimado) <= 0)    { setError('Valor estimado deve ser maior que zero.'); return; }
    if (!form.modalidade_licitatoria)                                { setError('Selecione a modalidade.'); return; }
    if (form.aquisicao_emergencial && !form.justificativa_emergencial.trim()) { setError('Justificativa de emergência obrigatória.'); return; }

    setSaving(true); setError(null);
    try {
      await geproService.criarDemanda({ ...form, quantidade: Number(form.quantidade), valor_estimado: Number(form.valor_estimado), aquisicao_emergencial: Boolean(form.aquisicao_emergencial) });
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar demanda.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-800">Nova Demanda Licitatória</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Título *</label>
            <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Título da demanda" />
          </div>

          <div>
            <label className="flex justify-between text-xs font-bold text-slate-600 uppercase mb-1">
              <span>Descrição * (mín. 50 caracteres)</span>
              <span className={form.descricao.trim().length >= 50 ? 'text-emerald-500' : 'text-slate-400'}>{form.descricao.trim().length}/50</span>
            </label>
            <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[100px] resize-y" value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descreva a necessidade detalhadamente…" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tipo de Equipamento *</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" value={form.tipo_equipamento} onChange={e => set('tipo_equipamento', e.target.value)} placeholder="Ex: Notebook, Monitor…" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Quantidade *</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" type="number" min="1" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Valor Estimado (R$) *</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" type="number" step="0.01" value={form.valor_estimado} onChange={e => set('valor_estimado', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Modalidade *</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white" value={form.modalidade_licitatoria} onChange={e => set('modalidade_licitatoria', e.target.value)}>
                <option value="">Selecione…</option>
                {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Setor Solicitante</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" value={form.setor_solicitante} onChange={e => set('setor_solicitante', e.target.value)} placeholder="Ex: TI, Administrativo…" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Data Prevista</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" type="date" value={form.data_necessidade_prevista} onChange={e => set('data_necessidade_prevista', e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="emergencial" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" checked={form.aquisicao_emergencial} onChange={e => set('aquisicao_emergencial', e.target.checked)} />
            <label htmlFor="emergencial" className="text-sm text-slate-700 cursor-pointer font-medium">Aquisição emergencial (dispensa/inexigibilidade)</label>
          </div>

          {form.aquisicao_emergencial && (
            <div className="animate-fadeIn mt-4">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Justificativa de Emergência *</label>
              <textarea className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm min-h-[80px]" value={form.justificativa_emergencial} onChange={e => set('justificativa_emergencial', e.target.value)} placeholder="Motivo da urgência…" />
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 sticky bottom-0 rounded-b-xl">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Registrando…' : 'Registrar Demanda'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────

export default function GEPRODashboard() {
  const navigate = useNavigate();

  const [stats, setStats]       = useState<any>(null);
  const [demandas, setDemandas] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, d] = await Promise.all([geproService.getStats(), geproService.listarDemandas({})]);
      setStats(s);
      setDemandas(Array.isArray(d) ? d : d?.rows ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── computed ──

  const processosAtivos = useMemo(() =>
    demandas.filter(d => d.status !== 'encerramento_finalizado').length, [demandas]);

  const valorTotal = useMemo(() =>
    demandas.reduce((s, d) => s + Number(d.valor_estimado ?? 0), 0), [demandas]);

  const atrasados = useMemo(() =>
    demandas.filter(d => {
      if (d.status === 'encerramento_finalizado') return false;
      const days = daysUntil(d.data_necessidade_prevista);
      return days !== null && days < 0;
    }), [demandas]);

  const taxaNoPrazo = useMemo(() => {
    if (!processosAtivos) return 100;
    return Math.round(((processosAtivos - atrasados.length) / processosAtivos) * 100);
  }, [processosAtivos, atrasados]);

  const alertItems = useMemo(() => {
    const items: { type: 'error' | 'warn' | 'info'; title: string; desc: string }[] = [];

    const stalledApprovals = demandas.filter(d => d.status === 'necessidade_rascunho' && (daysUntil(d.data_criacao) ?? 0) < -15);
    if (stalledApprovals.length)
      items.push({ type: 'error', title: 'Aprovação parada há +15 dias', desc: `${stalledApprovals.slice(0, 3).map(d => d.numero_demanda).join(', ')} — ${stalledApprovals.length} processo(s)` });

    const criticalDeadline = demandas.filter(d => {
      if (d.status === 'encerramento_finalizado') return false;
      const days = daysUntil(d.data_necessidade_prevista);
      return days !== null && days >= 0 && days <= 2;
    });
    if (criticalDeadline.length)
      items.push({ type: 'warn', title: 'Prazo de encaminhamento crítico', desc: `${criticalDeadline.slice(0, 2).map(d => d.numero_demanda).join(', ')} — vence em breve` });

    const nfPendente = demandas.filter(d => d.status === 'recebimento_provisorio');
    if (nfPendente.length)
      items.push({ type: 'warn', title: 'NF pendente de registro', desc: `${nfPendente.slice(0, 2).map(d => d.numero_demanda).join(', ')} — recebimento físico ok` });

    const stalledInstrucao = demandas.filter(d => d.status === 'instrucao_rascunho' && (daysUntil(d.data_criacao) ?? 0) < -10);
    if (stalledInstrucao.length)
      items.push({ type: 'info', title: 'Instrução técnica parada', desc: `${stalledInstrucao.slice(0, 1).map(d => d.numero_demanda).join(', ')} — requer acompanhamento` });

    return items.slice(0, 4);
  }, [demandas]);

  const upcomingDeadlines = useMemo(() =>
    demandas
      .filter(d => d.status !== 'encerramento_finalizado' && daysUntil(d.data_necessidade_prevista) !== null)
      .map(d => ({ ...d, _days: daysUntil(d.data_necessidade_prevista)! }))
      .filter(d => d._days >= -1)
      .sort((a, b) => a._days - b._days)
      .slice(0, 5),
  [demandas]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const m = dt.getMonth(); const y = dt.getFullYear();
      const label = dt.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const abertos    = demandas.filter(d => { const x = new Date(d.data_criacao); return x.getMonth() === m && x.getFullYear() === y; }).length;
      const encerrados = demandas.filter(d => { if (d.status !== 'encerramento_finalizado') return false; const x = new Date(d.data_criacao); return x.getMonth() === m && x.getFullYear() === y; }).length;
      return { label, abertos, encerrados };
    });
  }, [demandas]);

  const recentActivity = useMemo(() =>
    [...demandas].sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()).slice(0, 4),
  [demandas]);

  const thisMonthNew = useMemo(() => {
    const now = new Date();
    return demandas.filter(d => { const dt = new Date(d.data_criacao); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); }).length;
  }, [demandas]);

  // ── pipeline ──

  const pipeline = [
    { label: 'Necessidade',     sub: 'aguardando aprovação', value: (stats?.totais?.rascunho ?? 0) + (stats?.totais?.aguardando_instrucao ?? 0), bg: 'bg-blue-50', lc: 'text-blue-500', vc: 'text-blue-800', flex: 2,   bar: 'bg-blue-500' },
    { label: 'Instrução',       sub: 'em desenvolvimento', value: stats?.totais?.em_instrucao ?? 0,   bg: 'bg-emerald-50', lc: 'text-emerald-600', vc: 'text-emerald-800', flex: 1.5, bar: 'bg-emerald-500' },
    { label: 'Encaminhamento',  sub: 'aguardando NE',        value: stats?.totais?.em_encaminhamento ?? 0, bg: 'bg-amber-50', lc: 'text-amber-600', vc: 'text-amber-800', flex: 1.2, bar: 'bg-amber-500' },
    { label: 'Recebimento',     sub: 'testes técnicos',      value: stats?.totais?.em_recebimento ?? 0,   bg: 'bg-pink-50', lc: 'text-pink-600', vc: 'text-pink-800', flex: 1,   bar: 'bg-pink-500' },
    { label: 'Encerramento',    sub: 'finalizado',            value: stats?.totais?.finalizadas ?? 0,      bg: 'bg-slate-100', lc: 'text-slate-500', vc: 'text-slate-800', flex: 0.6, bar: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestão de Aquisições</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Acompanhamento operacional de demandas · Lei 14.133/2021</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all"
            onClick={() => navigate('/gepro/executivo')}
          >
            <LayoutDashboard className="w-4 h-4" /> Visão Executiva
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" /> Nova Demanda
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Processos ativos</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-slate-800 leading-none">{loading ? '…' : processosAtivos}</div>
          <div className="text-xs font-semibold text-emerald-600 mt-3 flex items-center gap-1">
            ↑ {loading ? '…' : thisMonthNew} este mês
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor estimado</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-slate-800 leading-none">{loading ? '…' : fmtCompact(valorTotal)}</div>
          <div className="text-xs font-semibold text-slate-500 mt-3">
            em processos abertos
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa no prazo</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-slate-800 leading-none">{loading ? '…' : `${taxaNoPrazo}%`}</div>
          <div className="text-xs font-semibold text-amber-600 mt-3">
            ⚠ {loading ? '…' : atrasados.length} atrasados
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Atenção necessária</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Bell className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black text-orange-900 leading-none">{loading ? '…' : alertItems.length}</div>
          <div className="text-xs font-semibold text-orange-700 mt-3">
            itens requerem sua ação
          </div>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-slate-400" /> Funil de Processos
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{loading ? '…' : processosAtivos} processos ativos em 2026</span>
        </div>
        
        <div className="flex gap-2">
          {pipeline.map((p, i) => (
            <React.Fragment key={p.label}>
              <div className={`flex-[${p.flex}] ${p.bg} rounded-lg p-4 text-center transition-transform hover:-translate-y-1 hover:shadow-sm duration-200 cursor-default`} style={{ flex: p.flex }}>
                <div className={`text-[9px] font-bold uppercase tracking-widest ${p.lc} mb-2`}>{p.label}</div>
                <div className={`text-3xl font-black ${p.vc} mb-1`}>{loading ? '…' : p.value}</div>
                <div className={`text-[10px] font-medium ${p.lc}`}>{p.sub}</div>
              </div>
              {i < pipeline.length - 1 && (
                <div className="flex items-center text-slate-300 font-bold px-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex h-2 rounded-full overflow-hidden mt-6 gap-1 bg-slate-100">
          {pipeline.map((p, i) => (
            <div key={i} className={`h-full ${p.bar} transition-all duration-1000`} style={{ flex: p.flex }} />
          ))}
        </div>
      </div>

      {/* Row 3: Alerts + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Alertas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Requer Atenção
          </h2>
          {loading ? (
             <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-1/2"></div></div></div>
          ) : alertItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Info className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhum alerta pendente.<br/>Tudo sob controle.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertItems.map((a, i) => {
                const isError = a.type === 'error';
                const isInfo  = a.type === 'info';
                return (
                  <div key={i} className={`flex items-start p-3 rounded-lg border-l-4 ${isError ? 'bg-red-50 border-red-500' : isInfo ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'}`}>
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${isError ? 'text-red-900' : isInfo ? 'text-blue-900' : 'text-orange-900'}`}>{a.title}</div>
                      <div className={`text-xs mt-1 font-medium ${isError ? 'text-red-700' : isInfo ? 'text-blue-700' : 'text-orange-700'}`}>{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prazos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-blue-500" /> Próximos Prazos
          </h2>
          {loading ? (
             <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-1/2"></div></div></div>
          ) : upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhum prazo cadastrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingDeadlines.map((d) => {
                const db = daysBadge(d._days);
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 py-3 group cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                    onClick={() => navigate(`/gepro/demandas/${d.id}`)}
                  >
                    <div className={`${db.bg} ${db.color} text-[10px] font-bold px-2 py-1 rounded-md min-w-[40px] text-center`}>{db.text}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {phaseLabel(d.status)} — {d.tipo_equipamento ?? d.titulo}
                      </div>
                      <div className="text-xs font-medium text-slate-500 truncate">{d.numero_demanda}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Row 4: Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Gráfico */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Processos Licitatórios — 2026</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Comparativo de demandas abertas e finalizadas por mês</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Abertos
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Finalizados
              </span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={20} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  labelStyle={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}
                />
                <Bar dataKey="abertos"    name="Abertos"    fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="encerrados" name="Encerrados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-6">
            <LayoutDashboard className="w-4 h-4 text-indigo-500" /> Atividade Recente
          </h2>
          {loading ? (
             <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-1/2"></div></div></div>
          ) : (
            <div className="relative border-l border-slate-200 ml-3 space-y-6">
              {recentActivity.map((d, index) => {
                const act = activityMeta(d.status);
                return (
                  <div key={d.id} className="relative pl-6 group cursor-pointer" onClick={() => navigate(`/gepro/demandas/${d.id}`)}>
                    <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full ${act.bg} ${act.color} flex items-center justify-center text-xs font-bold ring-4 ring-white group-hover:scale-110 transition-transform`}>
                      {act.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{act.title}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{d.numero_demanda} — {d.titulo}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1.5 uppercase">{fmtDate(d.data_criacao)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {showModal && <NovaDemandaModal onClose={() => setShowModal(false)} onSaved={loadData} />}
    </div>
  );
}
