import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as geproService from '../../services/geproService';

type Tab = 'etp' | 'tr' | 'cotacoes' | 'validacao';


// ── Helper ────────────────────────────────────────────────────────────────────

function fmtCurrency(v: string | number | null | undefined) {
  if (v == null || v === '') return '—';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function metaItem(label: string, value: string | null | undefined) {
  return (
    <div className="text-xs">
      <div className="text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-slate-800 font-bold">{value || '—'}</div>
    </div>
  );
}

const MODALIDADE_LABELS: Record<string, string> = {
  pregao: 'Pregão',
  concorrencia: 'Concorrência',
  srp: 'SRP',
  convite: 'Convite',
  ata_registro_precos: 'Ata de Registro de Preços',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Fase2Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fase2, setFase2] = useState<any>(null);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('etp');
  const [etpForm, setETPForm] = useState<Record<string, string>>({});
  const [trForm, setTRForm] = useState<Record<string, string>>({});
  const [cotacaoForm, setCotacaoForm] = useState({
    fornecedor_id: '',
    valor_unitario: '',
    prazo_entrega_dias: '',
    validade_cotacao: '',
    descricao_produto_cotado: '',
    observacoes: '',
  });
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCotacaoForm, setShowCotacaoForm] = useState(false);

  const showMsg = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') { setSuccess(msg); setError(null); }
    else { setError(msg); setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [f2, fns] = await Promise.all([
        geproService.getFase2(id),
        geproService.getFornecedores(),
      ]);
      setFase2(f2);
      setFornecedores(fns);
      if (f2.etp) {
        const e = f2.etp;
        setETPForm({
          justificativa_tecnica: e.justificativa_tecnica || '',
          categoria_equipamento: e.categoria_equipamento || '',
          criterios_rejeicao: e.criterios_rejeicao || '',
          garantia_periodo: e.garantia_periodo || '',
          suporte_tecnico: e.suporte_tecnico || '',
          processador_tipo: e.processador_tipo || '',
          processador_velocidade: e.processador_velocidade || '',
          processador_nucleos: e.processador_nucleos?.toString() || '',
          memoria_ram_minima: e.memoria_ram_minima || '',
          armazenamento_tipo: e.armazenamento_tipo || '',
          armazenamento_capacidade: e.armazenamento_capacidade || '',
          conectividade: e.conectividade || '',
          sistema_operacional: e.sistema_operacional || '',
          condicoes_entrega: e.condicoes_entrega || '',
          certificacoes_obrigatorias: e.certificacoes_obrigatorias || '',
          posicionamento_conclusivo: e.posicionamento_conclusivo || '',
          estimativa_quantidades: e.estimativa_quantidades || '',
          justificativa_parcelamento: e.justificativa_parcelamento || '',
        });
      }
      if (f2.tr) {
        const t = f2.tr;
        setTRForm({
          objeto: t.objeto || '',
          justificativa: t.justificativa || '',
          descricao_detalhada: t.descricao_detalhada || '',
          criterio_selecao: t.criterio_selecao || '',
          prazo_entrega_dias_max: t.prazo_entrega_dias_max?.toString() || '',
          condicoes_pagamento: t.condicoes_pagamento || '',
          valor_estimado_unitario: t.valor_estimado_unitario?.toString() || '',
          valor_estimado_total: t.valor_estimado_total?.toString() || '',
          prazo_garantia_meses: t.prazo_garantia_meses?.toString() || '',
          multa_atraso_percentual: t.multa_atraso_percentual?.toString() || '',
          clauses_rescisao: t.clauses_rescisao || '',
          modelo_execucao_objeto: t.modelo_execucao_objeto || '',
          modelo_gestao_contrato: t.modelo_gestao_contrato || '',
          criterios_medicao_pagamento: t.criterios_medicao_pagamento || '',
          orgaos_participantes: t.orgaos_participantes || '',
          enderecos_entrega: t.enderecos_entrega || '',
          requisitos_prova_conceito: t.requisitos_prova_conceito || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados da Fase 2.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadChecklist = useCallback(async () => {
    if (!id) return;
    try {
      const c = await geproService.getChecklist(id);
      setChecklist(c);
    } catch {}
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'validacao') loadChecklist();
  }, [activeTab, loadChecklist]);

  const handleSaveETP = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await geproService.submitETP(id, etpForm);
      showMsg('ETP salvo com sucesso.', 'success');
      await loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.message || 'Erro ao salvar ETP.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTR = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await geproService.submitTR(id, trForm);
      showMsg('Termo de Referência salvo com sucesso.', 'success');
      await loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.message || 'Erro ao salvar TR.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCotacao = async () => {
    if (!id) return;
    if (!cotacaoForm.fornecedor_id || !cotacaoForm.valor_unitario) {
      showMsg('Fornecedor e valor unitário são obrigatórios.', 'error');
      return;
    }
    setSaving(true);
    try {
      await geproService.addCotacao(id, {
        fornecedor_id: Number(cotacaoForm.fornecedor_id),
        valor_unitario: Number(cotacaoForm.valor_unitario),
        prazo_entrega_dias: cotacaoForm.prazo_entrega_dias ? Number(cotacaoForm.prazo_entrega_dias) : undefined,
        validade_cotacao: cotacaoForm.validade_cotacao || undefined,
        descricao_produto_cotado: cotacaoForm.descricao_produto_cotado || undefined,
        observacoes: cotacaoForm.observacoes || undefined,
      });
      showMsg('Cotação adicionada com sucesso.', 'success');
      setCotacaoForm({ fornecedor_id: '', valor_unitario: '', prazo_entrega_dias: '', validade_cotacao: '', descricao_produto_cotado: '', observacoes: '' });
      setShowCotacaoForm(false);
      await loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.message || 'Erro ao adicionar cotação.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelecionarVencedor = async (cotacaoId: number) => {
    if (!id) return;
    setSaving(true);
    try {
      await geproService.selecionarVencedor(id, cotacaoId);
      showMsg('Fornecedor vencedor selecionado.', 'success');
      await loadData();
    } catch (err: any) {
      showMsg(err.response?.data?.message || 'Erro ao selecionar vencedor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEncaminhar = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await geproService.encaminhar(id);
      showMsg('Demanda encaminhada para análise jurídica!', 'success');
      await loadChecklist();
      setTimeout(() => navigate(`/gepro/demandas/${id}`), 1500);
    } catch (err: any) {
      showMsg(err.response?.data?.message || 'Erro ao encaminhar demanda.', 'error');
      await loadChecklist();
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center p-16 text-slate-400 text-sm font-medium">
        Carregando Fase 2…
      </div>
    );
  }

  if (!fase2) {
    return (
      <div className="text-center p-16">
        <p className="text-red-600 mb-3 font-medium">Demanda não encontrada.</p>
        <Link to="/gepro/dashboard" className="text-blue-900 text-sm font-bold hover:underline">← Voltar ao Dashboard</Link>
      </div>
    );
  }

  const demanda = fase2.demanda;
  const trPermitido = fase2.tr_permitido;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'etp', label: 'ETP' },
    ...(trPermitido ? [{ key: 'tr' as Tab, label: 'Termo de Referência' }] : []),
    { key: 'cotacoes', label: 'Cotações' },
    { key: 'validacao', label: 'Validação' },
  ];

  return (
    <div>
      {/* breadcrumb */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
        <Link to="/gepro/dashboard" className="hover:text-blue-600 transition-colors">← Dashboard</Link>
        {' / '}
        <Link to={`/gepro/demandas/${id}`} className="hover:text-blue-600 transition-colors">{demanda.numero_demanda}</Link>
        {' / Fase 2'}
      </p>

      {/* Page header */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="font-mono text-xs text-slate-400 mb-1.5 font-semibold">
            {demanda.numero_demanda}
          </div>
          <div className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
            {demanda.objeto}
          </div>
          <div className="text-sm font-medium text-slate-500 mb-6">
            Fase 2: Instrução Técnica — ETP, Termo de Referência e Cotações
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            {metaItem('Modalidade', MODALIDADE_LABELS[demanda.modalidade_licitatoria] || demanda.modalidade_licitatoria)}
            {metaItem('Valor Estimado', fmtCurrency(demanda.valor_estimado))}
            {metaItem('Status', demanda.status?.replace(/_/g, ' '))}
            {metaItem('Solicitante', demanda.solicitante_nome || `ID ${demanda.solicitante_id}`)}
          </div>
        </div>
      </div>

      {/* Alert messages */}
      {error && <div className="p-4 rounded-xl mb-6 text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>}
      {success && <div className="p-4 rounded-xl mb-6 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">{success}</div>}

      {/* Main tabs card */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto custom-scrollbar">
          {tabs.map(({ key, label }) => (
            <button key={key} className={`px-6 py-4 cursor-pointer text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === key ? 'text-blue-900 border-blue-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── ETP Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'etp' && (
          <div className="p-6">
            <div className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide">Estudo Técnico Preliminar (ETP)</div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Justificativa da Necessidade *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={etpForm.justificativa_tecnica || ''}
                onChange={(e) => setETPForm({ ...etpForm, justificativa_tecnica: e.target.value })}
                placeholder="Descreva por que o item é necessário (mín. 50 caracteres)…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Categoria do Equipamento *</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.categoria_equipamento || ''}
                  onChange={(e) => setETPForm({ ...etpForm, categoria_equipamento: e.target.value })}
                  placeholder="Ex: Computador, Monitor, Impressora…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Sistema Operacional</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.sistema_operacional || ''}
                  onChange={(e) => setETPForm({ ...etpForm, sistema_operacional: e.target.value })}
                  placeholder="Ex: Windows 11, Ubuntu 22.04…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Processador</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.processador_tipo || ''}
                  onChange={(e) => setETPForm({ ...etpForm, processador_tipo: e.target.value })}
                  placeholder="Ex: Intel Core i5"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Velocidade (GHz)</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.processador_velocidade || ''}
                  onChange={(e) => setETPForm({ ...etpForm, processador_velocidade: e.target.value })}
                  placeholder="Ex: 2.4 GHz"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Núcleos</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  value={etpForm.processador_nucleos || ''}
                  onChange={(e) => setETPForm({ ...etpForm, processador_nucleos: e.target.value })}
                  placeholder="Ex: 8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Memória RAM Mínima</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.memoria_ram_minima || ''}
                  onChange={(e) => setETPForm({ ...etpForm, memoria_ram_minima: e.target.value })}
                  placeholder="Ex: 8 GB DDR4"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Armazenamento</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.armazenamento_capacidade || ''}
                  onChange={(e) => setETPForm({ ...etpForm, armazenamento_capacidade: e.target.value })}
                  placeholder="Ex: 256 GB SSD"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Conectividade</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.conectividade || ''}
                  onChange={(e) => setETPForm({ ...etpForm, conectividade: e.target.value })}
                  placeholder="Ex: Wi-Fi 6, USB-A, USB-C…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Condições de Entrega</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.condicoes_entrega || ''}
                  onChange={(e) => setETPForm({ ...etpForm, condicoes_entrega: e.target.value })}
                  placeholder="Ex: instalação incluída, embalagem lacrada…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Período de Garantia</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.garantia_periodo || ''}
                  onChange={(e) => setETPForm({ ...etpForm, garantia_periodo: e.target.value })}
                  placeholder="Ex: 12 meses on-site…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Suporte Técnico</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.suporte_tecnico || ''}
                  onChange={(e) => setETPForm({ ...etpForm, suporte_tecnico: e.target.value })}
                  placeholder="Ex: telefone + visita em até 24h…"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Certificações Obrigatórias</label>
              <input
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                value={etpForm.certificacoes_obrigatorias || ''}
                onChange={(e) => setETPForm({ ...etpForm, certificacoes_obrigatorias: e.target.value })}
                placeholder="Ex: INMETRO, ANATEL, Energy Star…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Critérios de Rejeição *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={etpForm.criterios_rejeicao || ''}
                onChange={(e) => setETPForm({ ...etpForm, criterios_rejeicao: e.target.value })}
                placeholder="Condições que implicam rejeição do item na entrega (mín. 20 caracteres)…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Posicionamento Conclusivo *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={etpForm.posicionamento_conclusivo || ''}
                onChange={(e) => setETPForm({ ...etpForm, posicionamento_conclusivo: e.target.value })}
                placeholder="Posicionamento conclusivo sobre a viabilidade da contratação (mín. 50 caracteres)…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Estimativa de Quantidades *</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.estimativa_quantidades || ''}
                  onChange={(e) => setETPForm({ ...etpForm, estimativa_quantidades: e.target.value })}
                  placeholder="Ex: 50 unidades baseadas no consumo anterior…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Justificativa de Parcelamento *</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  value={etpForm.justificativa_parcelamento || ''}
                  onChange={(e) => setETPForm({ ...etpForm, justificativa_parcelamento: e.target.value })}
                  placeholder="Ex: Não haverá parcelamento devido a..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" onClick={handleSaveETP} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar ETP'}
              </button>
            </div>
          </div>
        )}

        {/* ── TR Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'tr' && trPermitido && (
          <div className="p-6">
            <div className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide">Termo de Referência (TR)</div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Objeto *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.objeto || ''}
                onChange={(e) => setTRForm({ ...trForm, objeto: e.target.value })}
                placeholder="Descrição sucinta do objeto da contratação (mín. 30 caracteres)…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Justificativa *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.justificativa || ''}
                onChange={(e) => setTRForm({ ...trForm, justificativa: e.target.value })}
                placeholder="Justificativa da necessidade da contratação (mín. 50 caracteres)…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Descrição Detalhada</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[120px] resize-y"
                value={trForm.descricao_detalhada || ''}
                onChange={(e) => setTRForm({ ...trForm, descricao_detalhada: e.target.value })}
                placeholder="Especificação completa do objeto, incluindo requisitos técnicos e funcionais…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Valor Estimado Unitário (R$)</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  step="0.01"
                  value={trForm.valor_estimado_unitario || ''}
                  onChange={(e) => setTRForm({ ...trForm, valor_estimado_unitario: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Valor Estimado Total (R$)</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  step="0.01"
                  value={trForm.valor_estimado_total || ''}
                  onChange={(e) => setTRForm({ ...trForm, valor_estimado_total: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Prazo de Entrega (dias) *</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  value={trForm.prazo_entrega_dias_max || ''}
                  onChange={(e) => setTRForm({ ...trForm, prazo_entrega_dias_max: e.target.value })}
                  placeholder="Ex: 30"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Prazo de Garantia (meses)</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  value={trForm.prazo_garantia_meses || ''}
                  onChange={(e) => setTRForm({ ...trForm, prazo_garantia_meses: e.target.value })}
                  placeholder="Ex: 12"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Multa por Atraso (%)</label>
                <input
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                  type="number"
                  step="0.01"
                  value={trForm.multa_atraso_percentual || ''}
                  onChange={(e) => setTRForm({ ...trForm, multa_atraso_percentual: e.target.value })}
                  placeholder="Ex: 0.5"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Critério de Seleção *</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white"
                value={trForm.criterio_selecao || ''}
                onChange={(e) => setTRForm({ ...trForm, criterio_selecao: e.target.value })}
              >
                <option value="">Selecione…</option>
                <option value="menor_preco">Menor Preço</option>
                <option value="melhor_tecnica_preco">Melhor Técnica e Preço</option>
                <option value="maior_desconto">Maior Desconto</option>
                <option value="melhor_tecnica">Melhor Técnica</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Condições de Pagamento *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.condicoes_pagamento || ''}
                onChange={(e) => setTRForm({ ...trForm, condicoes_pagamento: e.target.value })}
                placeholder="Ex: 30 dias após entrega, mediante nota fiscal…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Cláusulas de Rescisão</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.clauses_rescisao || ''}
                onChange={(e) => setTRForm({ ...trForm, clauses_rescisao: e.target.value })}
                placeholder="Condições para rescisão contratual…"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Modelo de Execução do Objeto *</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.modelo_execucao_objeto || ''}
                onChange={(e) => setTRForm({ ...trForm, modelo_execucao_objeto: e.target.value })}
                placeholder="Como o objeto será entregue/executado…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Modelo de Gestão do Contrato *</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                  value={trForm.modelo_gestao_contrato || ''}
                  onChange={(e) => setTRForm({ ...trForm, modelo_gestao_contrato: e.target.value })}
                  placeholder="Como o contrato será gerido/fiscalizado…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Critérios de Medição/Pagamento *</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                  value={trForm.criterios_medicao_pagamento || ''}
                  onChange={(e) => setTRForm({ ...trForm, criterios_medicao_pagamento: e.target.value })}
                  placeholder="Critérios para aferição e pagamento…"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Órgãos Participantes *</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                  value={trForm.orgaos_participantes || ''}
                  onChange={(e) => setTRForm({ ...trForm, orgaos_participantes: e.target.value })}
                  placeholder="Relação de órgãos participantes do SRP…"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Endereços de Entrega *</label>
                <textarea
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                  value={trForm.enderecos_entrega || ''}
                  onChange={(e) => setTRForm({ ...trForm, enderecos_entrega: e.target.value })}
                  placeholder="Endereços onde os bens/serviços serão entregues…"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Prova de Conceito</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"
                value={trForm.requisitos_prova_conceito || ''}
                onChange={(e) => setTRForm({ ...trForm, requisitos_prova_conceito: e.target.value })}
                placeholder="Requisitos para Prova de Conceito (se aplicável)…"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" onClick={handleSaveTR} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar Termo de Referência'}
              </button>
            </div>
          </div>
        )}

        {/* ── Cotações Tab ─────────────────────────────────────────────── */}
        {activeTab === 'cotacoes' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide">Cotações ({fase2.cotacoes?.length ?? 0} / 3 mínimo)</div>
              <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" onClick={() => setShowCotacaoForm(true)}>
                + Nova Cotação
              </button>
            </div>

            {/* Add cotação form */}
            {showCotacaoForm && (
              <div className="border border-slate-200 rounded-xl p-6 mb-6 bg-slate-50 shadow-sm">
                <div className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide">Registrar Nova Cotação</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Fornecedor *</label>
                    <select
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white"
                      value={cotacaoForm.fornecedor_id}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, fornecedor_id: e.target.value })}
                    >
                      <option value="">Selecione o fornecedor…</option>
                      {fornecedores.map((f) => (
                        <option key={f.id} value={f.id}>{f.nome} — {f.cnpj || 'sem CNPJ'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Valor Unitário (R$) *</label>
                    <input
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                      type="number"
                      step="0.01"
                      value={cotacaoForm.valor_unitario}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, valor_unitario: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Prazo de Entrega (dias)</label>
                    <input
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                      type="number"
                      value={cotacaoForm.prazo_entrega_dias}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, prazo_entrega_dias: e.target.value })}
                      placeholder="Ex: 30"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Validade da Cotação</label>
                    <input
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                      type="date"
                      value={cotacaoForm.validade_cotacao}
                      onChange={(e) => setCotacaoForm({ ...cotacaoForm, validade_cotacao: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Produto Cotado</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"
                    value={cotacaoForm.descricao_produto_cotado}
                    onChange={(e) => setCotacaoForm({ ...cotacaoForm, descricao_produto_cotado: e.target.value })}
                    placeholder="Descrição do produto ou serviço cotado…"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" onClick={handleAddCotacao} disabled={saving}>
                    {saving ? 'Salvando…' : 'Registrar Cotação'}
                  </button>
                  <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setShowCotacaoForm(false)}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Cotações table */}
            {fase2.cotacoes?.length === 0 ? (
              <p className="text-slate-400 text-sm py-5">Nenhuma cotação registrada ainda.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">Fornecedor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">Valor Unitário</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">Prazo Entrega</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">Validade</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50"></th>
                  </tr>
                </thead>
                <tbody>
                  {fase2.cotacoes.map((c: any) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">{c.numero_sequencial}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600"><strong>{c.fornecedor_nome || `ID ${c.fornecedor_id}`}</strong></td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">{fmtCurrency(c.valor_unitario)}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">{c.prazo_entrega_dias ? `${c.prazo_entrega_dias} dias` : '—'}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">{c.validade_cotacao ? new Date(c.validade_cotacao).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">
                        {c.vencedor
                          ? <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">Selecionada</span>
                          : <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">Aguardando</span>}
                      </td>
                      <td className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600">
                        {!c.vencedor && (
                          <button
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                            onClick={() => handleSelecionarVencedor(c.id)}
                            disabled={saving}
                          >
                            Selecionar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {fase2.cotacoes?.length > 0 && fase2.cotacoes.length < 3 && (
              <p className="mt-4 text-amber-800 text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 font-semibold">
                Mínimo de 3 cotações requerido pela Lei 14.133/2021. Adicione {3 - fase2.cotacoes.length} cotação(ões).
              </p>
            )}
          </div>
        )}

        {/* ── Validação Tab ──────────────────────────────────────────── */}
        {activeTab === 'validacao' && (
          <div className="p-6">
            <div className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide">Checklist de Validação — Lei 14.133/2021</div>

            {checklist ? (
              <>
                {checklist.itens.map((item: any, i: number) => (
                  <div key={i} className={`flex items-start gap-4 p-4 border rounded-xl mb-3 ${item.ok === false ? 'border-red-300 bg-red-50' : item.ok === null ? 'border-slate-200' : 'border-emerald-300 bg-emerald-50'}`}>
                    <span className="text-base">{item.ok === true ? '✅' : item.ok === false ? '❌' : '⬜'}</span>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700 font-medium">{item.item}</div>
                      {item.detalhe && <div className="text-xs text-slate-500 mt-0.5">{item.detalhe}</div>}
                      {item.observacao && <div className="text-xs text-slate-400 italic mt-0.5">{item.observacao}</div>}
                    </div>
                  </div>
                ))}

                <div className={`mt-6 p-4 rounded-xl border ${checklist.pode_avancar ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}>
                  <div className={`text-sm font-bold mb-1 ${checklist.pode_avancar ? "text-emerald-800" : "text-red-800"}`}>
                    {checklist.pode_avancar ? '✅ Fase 2 completa — pronta para encaminhamento' : '❌ Fase 2 incompleta — itens pendentes acima'}
                  </div>
                  <div className={`text-xs ${checklist.pode_avancar ? "text-emerald-700" : "text-red-700"}`}>
                    {checklist.pode_avancar
                      ? 'Todos os requisitos da Lei 14.133/2021 foram atendidos. Encaminhe para análise jurídica.'
                      : 'Resolva os itens marcados com ❌ antes de encaminhar.'}
                  </div>
                </div>

                {checklist.pode_avancar && demanda.status !== 'encaminhamento_aguardando_juridico' && (
                  <div className="flex gap-3 mt-6">
                    <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer" onClick={handleEncaminhar} disabled={saving}>
                      {saving ? 'Encaminhando…' : '→ Validar e Encaminhar à Fase 3 (Jurídico)'}
                    </button>
                  </div>
                )}

                {demanda.status === 'encaminhamento_aguardando_juridico' && (
                  <div className="mt-4 px-4 py-3 bg-blue-50 rounded-xl text-sm text-blue-800 font-semibold border border-blue-200">
                    Demanda já encaminhada para análise jurídica.
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm">Carregando checklist…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
