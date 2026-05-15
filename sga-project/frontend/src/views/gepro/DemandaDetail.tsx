import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as geproService from '../../services/geproService';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, Check, Download, FileSignature, Edit, ArrowRight, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────

const MODALIDADE_LABELS: Record<string, string> = {
  pregao:              'Pregão',
  concorrencia:        'Concorrência',
  ata_registro_precos: 'Ata de Registro de Preços (ARP)',
  srp:                 'SRP',
  convite:             'Convite',
};

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  necessidade_rascunho:               { label: 'Rascunho',         bg: 'bg-slate-100', color: 'text-slate-700' },
  necessidade_aprovada:               { label: 'Aprovada',         bg: 'bg-emerald-100', color: 'text-emerald-700' },
  instrucao_rascunho:                 { label: 'Instrução',        bg: 'bg-blue-100', color: 'text-blue-700' },
  instrucao_aprovada_gestor:          { label: 'Instr. Aprovada',  bg: 'bg-emerald-100', color: 'text-emerald-700' },
  instrucao_rejeitada_gestor:         { label: 'Instr. Rejeitada', bg: 'bg-red-100', color: 'text-red-700' },
  encaminhamento_aguardando_juridico: { label: 'Encaminhada',      bg: 'bg-amber-100', color: 'text-amber-700' },
  encaminhamento_aprovado_juridico:   { label: 'Enc. Aprovada',    bg: 'bg-emerald-100', color: 'text-emerald-700' },
  encaminhamento_rejeitado_juridico:  { label: 'Enc. Rejeitada',   bg: 'bg-red-100', color: 'text-red-700' },
  agendamento_pendente:               { label: 'Ag. Pendente',     bg: 'bg-amber-100', color: 'text-amber-700' },
  agendamento_confirmado:             { label: 'Ag. Confirmado',   bg: 'bg-emerald-100', color: 'text-emerald-700' },
  recebimento_provisorio:             { label: 'Recebimento',      bg: 'bg-blue-100', color: 'text-blue-700' },
  recebimento_testado_conforme:       { label: 'Testado OK',       bg: 'bg-emerald-100', color: 'text-emerald-700' },
  recebimento_rejeitado:              { label: 'Rejeitado',        bg: 'bg-red-100', color: 'text-red-700' },
  encerramento_pagamento_realizado:   { label: 'Pago',             bg: 'bg-emerald-100', color: 'text-emerald-700' },
  encerramento_finalizado:            { label: 'Finalizado',       bg: 'bg-slate-800', color: 'text-white' },
};

function fmtCurrency(v: unknown) {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function fmtDateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR');
}

function statusFase(status: string): number {
  if (status.startsWith('necessidade')) return 1;
  if (status.startsWith('instrucao'))   return 2;
  if (status.startsWith('encaminhamento')) return 3;
  if (status.startsWith('agendamento') || status.startsWith('recebimento')) return 4;
  if (status.startsWith('encerramento')) return 5;
  return 1;
}

// ── PhaseBar ──────────────────────────────────────────────────────────────────

const PHASES = ['Necessidade', 'Instrução Técnica', 'Encaminhamento', 'Recebimento', 'Encerramento'];

function PhaseBar({ current }: { current: number }) {
  return (
    <div className="flex items-center px-4 py-8 md:px-8 w-full overflow-x-auto">
      {PHASES.map((label, i) => {
        const fase = i + 1;
        const done    = fase < current;
        const active  = fase === current;
        const pending = fase > current;
        
        return (
          <React.Fragment key={fase}>
            <div className="flex flex-col items-center min-w-[100px]">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-3 shadow-sm transition-colors duration-300
                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}
              `}>
                {done ? <Check className="w-4 h-4" /> : fase}
              </div>
              <span className={`text-[11px] uppercase tracking-wide text-center px-2 ${active ? 'font-bold text-blue-900' : 'font-semibold text-slate-500'}`}>
                {label}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`flex-1 h-1 rounded-full mx-2 transition-colors duration-300 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── EmitirNEModal ─────────────────────────────────────────────────────────────

function EmitirNEModal({ demandaId, onClose, onDone }: { demandaId: string; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await geproService.emitirNE(demandaId);
      onDone();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao emitir NE.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Emitir Nota de Empenho</h3>
          </div>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Confirma a emissão da Nota de Empenho para esta demanda? O status será movido automaticamente para <strong className="text-amber-700">Agendamento Pendente</strong>.
          </p>
          {error && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50" onClick={confirm} disabled={loading}>
              {loading ? 'Emitindo...' : 'Confirmar Emissão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mock DFD Modal ────────────────────────────────────────────────────────────

function DocumentPreviewModal({ demanda, onClose }: { demanda: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-6">
      <div className="bg-slate-50 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-fadeIn">
        <div className="px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Visualização de Documento - DFD Oficial
          </h3>
          <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={onClose}>
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-slate-200">
          {/* Folha A4 Mock */}
          <div className="bg-white p-12 shadow-md max-w-[210mm] w-full min-h-[297mm] text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-3xl">🏛️</div>
              <h2 className="text-sm font-bold mb-1">PREFEITURA DO RECIFE</h2>
              <h3 className="text-xs mb-6">SECRETARIA EXECUTIVA DE GESTÃO</h3>
              <h1 className="text-base font-bold mb-3 underline">DOCUMENTO DE FORMALIZAÇÃO DE DEMANDA (DFD)</h1>
              <p className="text-xs">Processo Licitatório nº {demanda?.numero_demanda} / {new Date().getFullYear()}</p>
            </div>
            
            <div className="text-xs leading-relaxed text-justify space-y-4">
              <p><strong>1. SETOR REQUISITANTE:</strong> {demanda?.setor_solicitante ?? 'Gabinete'}</p>
              <p><strong>2. DESCRIÇÃO SUCINTA DO OBJETO:</strong> Aquisição de {demanda?.tipo_equipamento} ({demanda?.quantidade} unidades) para suprir as necessidades operacionais conforme justificativa técnica.</p>
              <p><strong>3. JUSTIFICATIVA DA NECESSIDADE DA CONTRATAÇÃO:</strong><br/>{demanda?.descricao}</p>
              <p><strong>4. QUANTIDADE A SER CONTRATADA:</strong> {demanda?.quantidade} unidades.</p>
              <p><strong>5. ESTIMATIVA DE VALOR:</strong> {fmtCurrency(demanda?.valor_estimado)}</p>
              <p><strong>6. PREVISÃO DATA DA CONTRATAÇÃO:</strong> {fmtDate(demanda?.data_necessidade_prevista)}</p>
              <p><strong>7. MODALIDADE SUGERIDA:</strong> {demanda?.modalidade_licitatoria?.toUpperCase()}</p>
            </div>

            <div className="mt-24 text-center">
              <div className="border-t border-black w-64 mx-auto mb-2"></div>
              <p className="text-xs m-0 font-bold">{demanda?.criador_nome}</p>
              <p className="text-[10px] m-0">Solicitante Responsável</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-end gap-3">
          <button className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors" onClick={onClose}>Fechar</button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" onClick={() => alert('Download do PDF gerado (Mock)')}>
            <Download className="w-4 h-4" /> Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Painel de Decisão Executiva (Assinatura Eletrônica) ──────────────────────

function PainelDecisaoModal({ demandaId, onClose, onDone }: { demandaId: string; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleAssinar = async () => {
    setLoading(true);
    try {
      await geproService.aprovar(demandaId, "Aprovado via Painel Executivo (Assinatura Eletrônica).");
      onDone();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-fadeIn">
        
        <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-slate-800 opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-blue-900 opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl border border-slate-700 shadow-inner">
              <FileSignature className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">Decisão Executiva</h3>
            <p className="mt-2 text-sm text-slate-400 font-medium">Aprovação e Assinatura Digital Lei 14.133</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resumo do Despacho
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li className="flex gap-2"><span>•</span> Alinhamento Estratégico: Conforme PCA</li>
              <li className="flex gap-2"><span>•</span> Impacto Orçamentário: Coberto por dotação</li>
              <li className="flex gap-2"><span>•</span> Risco Jurídico: Baixo (Minuta Padrão)</li>
            </ul>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Autenticação Gov.br / Token de Assinatura
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Insira sua senha de assinatura digital..." 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="space-y-3">
            <button 
              className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${password.length > 3 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              onClick={handleAssinar}
              disabled={loading || password.length <= 3}
            >
              {loading ? 'Autenticando e Assinando...' : 'Assinar Digitalmente e Aprovar'}
            </button>
            <button 
              className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── DemandaDetail ─────────────────────────────────────────────────────────────

export default function DemandaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [demanda, setDemanda] = useState<any>(null);
  const [observacoes, setObservacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [obsText, setObsText] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  
  const [showNEModal, setShowNEModal] = useState(false);
  const [showMockDFDModal, setShowMockDFDModal] = useState(false);
  const [showAprovarModal, setShowAprovarModal] = useState(false);

  const canEmitirNE = user?.role === 'admin' || user?.role === 'operator';

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [dem, obs] = await Promise.all([
        geproService.getDemanda(id),
        geproService.listarObservacoes(id),
      ]);
      setDemanda(dem);
      setObservacoes(obs ?? []);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao carregar demanda.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const submitObs = async () => {
    if (!obsText.trim() || obsText.trim().length < 3) return;
    setSavingObs(true);
    try {
      await geproService.addObservacao(id!, obsText.trim());
      setObsText('');
      const obs = await geproService.listarObservacoes(id!);
      setObservacoes(obs ?? []);
    } catch {
    } finally {
      setSavingObs(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Carregando detalhes...</div>;
  if (error)   return <div className="p-8 text-red-600 font-medium">{error}</div>;
  if (!demanda) return null;

  const fase    = statusFase(demanda.status);
  const badge   = STATUS_BADGE[demanda.status] ?? { label: demanda.status, bg: 'bg-slate-100', color: 'text-slate-700' };
  const acomp: any[] = demanda.acompanhamento ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <Link to="/gepro/dashboard" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-3 h-3" /> Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800">{demanda.numero_demanda}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{demanda.titulo}</h1>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${badge.bg} ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            <span className="text-slate-700 font-bold">{demanda.numero_demanda}</span> • Criado por {demanda.criador_nome ?? '—'} em {fmtDate(demanda.data_criacao)}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all" 
            onClick={() => setShowMockDFDModal(true)}
          >
            <FileText className="w-4 h-4" /> Visualizar DFD Oficial
          </button>
          
          {demanda.status === 'necessidade_rascunho' && (
             <button 
               className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-200 hover:bg-emerald-600 transition-all hover:-translate-y-0.5" 
               onClick={() => setShowAprovarModal(true)}
             >
               <FileSignature className="w-4 h-4" /> Decisão Executiva
             </button>
          )}
          
          {demanda.status === 'necessidade_aprovada' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all" onClick={() => navigate(`/gepro/demandas/${id}/fase2`)}>
              Instruções Técnicas <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {(demanda.status === 'instrucao_rascunho' || demanda.status === 'instrucao_aprovada_gestor') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all" onClick={() => navigate(`/gepro/demandas/${id}/fase2`)}>
              Fase 2 <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {demanda.status === 'encaminhamento_aguardando_juridico' && canEmitirNE && (
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-amber-600 transition-all" onClick={() => setShowNEModal(true)}>
              <FileText className="w-4 h-4" /> Emitir NE
            </button>
          )}
          
          {['agendamento_pendente','agendamento_confirmado','recebimento_provisorio',
             'recebimento_testado_conforme','encerramento_pagamento_realizado'].includes(demanda.status) && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all" onClick={() => navigate(`/gepro/demandas/${id}/fase4`)}>
              Fase 4/5 <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Phase bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <PhaseBar current={fase} />
      </div>

      {/* Meta grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Informações da Demanda</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modalidade</div>
            <div className="text-sm font-bold text-slate-800">{MODALIDADE_LABELS[demanda.modalidade_licitatoria] ?? demanda.modalidade_licitatoria ?? '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor Estimado</div>
            <div className="text-sm font-bold text-slate-800">{fmtCurrency(demanda.valor_estimado)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Equipamento / Qtd.</div>
            <div className="text-sm font-bold text-slate-800">{demanda.tipo_equipamento ?? '—'} × <span className="text-blue-600">{demanda.quantidade ?? '—'}</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data Necessidade</div>
            <div className="text-sm font-bold text-slate-800">{fmtDate(demanda.data_necessidade_prevista)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Setor Solicitante</div>
            <div className="text-sm font-bold text-slate-800">{demanda.setor_solicitante ?? '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gestor</div>
            <div className="text-sm font-bold text-slate-800">{demanda.gestor_nome ?? '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localidade Entrega</div>
            <div className="text-sm font-bold text-slate-800 truncate" title={demanda.localidade_entrega}>{demanda.localidade_entrega ?? '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergencial</div>
            <div className={`text-sm font-bold ${demanda.aquisicao_emergencial ? 'text-amber-600' : 'text-slate-800'}`}>
              {demanda.aquisicao_emergencial ? 'Sim' : 'Não'}
            </div>
          </div>
        </div>
        {demanda.descricao && (
          <div className="px-6 pb-6 pt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição da Necessidade</div>
            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{demanda.descricao}</div>
          </div>
        )}
      </div>

      {/* Timeline + Observações side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Histórico de Acompanhamento</h2>
          </div>
          <div className="p-6 flex-1 max-h-[400px] overflow-y-auto">
            {acomp.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum registro de acompanhamento.</p>
            ) : (
              <div className="space-y-0">
                {acomp.map((a: any, i: number) => (
                  <div key={a.id ?? i} className="flex gap-4 pb-6 relative group">
                    {/* Linha vertical */}
                    {i < acomp.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-slate-100" />
                    )}
                    <div className="mt-1 flex-shrink-0 z-10">
                      <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors" />
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <p className="text-sm font-semibold text-slate-800 mb-0.5">{a.observacao}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{fmtDateTime(a.data_acompanhamento)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Observações Internas</h2>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto max-h-[250px] mb-4 pr-2 space-y-3 custom-scrollbar">
              {observacoes.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma observação registrada.</p>
              ) : (
                observacoes.map((o: any) => (
                  <div key={o.id} className="bg-slate-50 border border-slate-100 rounded-lg p-4 transition-colors hover:bg-slate-100/50">
                    <p className="text-sm text-slate-700 leading-relaxed mb-2">{o.conteudo}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {o.autor_nome ?? o.autor_username ?? 'Usuário'} • {fmtDateTime(o.data_criacao)}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-auto">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Adicionar Observação</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                rows={3}
                value={obsText}
                onChange={(e) => setObsText(e.target.value)}
                placeholder="Digite uma observação interna para a equipe..."
              />
              <div className="flex justify-end mt-3">
                <button
                  className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  onClick={submitObs}
                  disabled={savingObs || obsText.trim().length < 3}
                >
                  <Edit className="w-4 h-4" />
                  {savingObs ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNEModal && (
        <EmitirNEModal
          demandaId={id!}
          onClose={() => setShowNEModal(false)}
          onDone={() => { setShowNEModal(false); load(); }}
        />
      )}
      {showMockDFDModal && (
        <DocumentPreviewModal demanda={demanda} onClose={() => setShowMockDFDModal(false)} />
      )}
      {showAprovarModal && (
        <PainelDecisaoModal 
          demandaId={id!} 
          onClose={() => setShowAprovarModal(false)} 
          onDone={() => { setShowAprovarModal(false); load(); }} 
        />
      )}
    </div>
  );
}
