import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as geproService from '../../services/geproService';
import { useAuth } from '../../contexts/AuthContext';

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function fmtDateTime(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('pt-BR');
}

// Status order used to determine which sections are active/locked
const STATUS_ORDER = [
  'agendamento_pendente',
  'agendamento_confirmado',
  'recebimento_provisorio',
  'recebimento_testado_conforme',
  'recebimento_rejeitado',
  'encerramento_pagamento_realizado',
  'encerramento_finalizado',
];

function statusGte(current: string, target: string) {
  return STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(target);
}

// ── styles ────────────────────────────────────────────────────────────────────


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value ?? '—'}</div>
    </div>
  );
}

function FormError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-red-700 text-xs mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">{msg}</p>;
}

// ── Section 1: Agendamento ────────────────────────────────────────────────────

function AgendamentoSection({ id, status, onRefresh }: { id: string; status: string; onRefresh: () => void }) {
  const isActive = status === 'agendamento_pendente';
  const isDone   = statusGte(status, 'agendamento_confirmado');
  const [agendamento, setAgendamento] = useState<any>(null);
  const [form, setForm] = useState({ data_proposta: '', localidade: '', observacoes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDone) {
      geproService.getAgendamento(id).then(setAgendamento).catch(() => {});
    }
  }, [id, isDone]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.data_proposta || !form.localidade) { setError('Data e localidade são obrigatórios.'); return; }
    setSaving(true); setError(null);
    try {
      await geproService.agendar(id, form as any);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao agendar entrega.');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive || isDone ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}>
        <div>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive || isDone ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}>{isDone ? '✓' : '1'}</span>
          Agendamento de Entrega
        </div>
        {isDone && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Concluído</span>}
        {isActive && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Aguardando</span>}
      </div>

      {isDone && agendamento && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          <InfoRow label="Data Proposta"  value={fmtDate(agendamento.data_proposta)} />
          <InfoRow label="Localidade"     value={agendamento.localidade} />
          <InfoRow label="Agendado por"   value={agendamento.agendado_por_nome} />
          {agendamento.observacoes && <InfoRow label="Observações" value={agendamento.observacoes} />}
        </div>
      )}

      {isActive && (
        <div className="p-6">
          <FormError msg={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Data Proposta *</label>
              <input type="date" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.data_proposta} onChange={e => set('data_proposta', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Localidade *</label>
              <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white" value={form.localidade} onChange={e => set('localidade', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="CETEC">CETEC</option>
                <option value="ALMOXARIFADO">Almoxarifado</option>
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Observações</label>
            <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y" value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Instruções para a entrega..." />
          </div>
          <div className="flex justify-end mt-2">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={submit} disabled={saving}>
              {saving ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      )}

      {!isActive && !isDone && (
        <p className="p-6 text-slate-400 text-sm m-0 bg-slate-50/50 italic">Aguardando emissão da Nota de Empenho.</p>
      )}
    </div>
  );
}

// ── Section 2: Recebimento Provisório ─────────────────────────────────────────

function RecebimentoSection({ id, status, onRefresh }: { id: string; status: string; onRefresh: () => void }) {
  const isActive = status === 'agendamento_confirmado';
  const isDone   = statusGte(status, 'recebimento_provisorio');
  const [recebimento, setRecebimento] = useState<any>(null);
  const [form, setForm] = useState({
    responsavel_recebimento: '', numero_nf: '', quantidade_recebida: '',
    data_recebimento_provisorio: '', observacoes_gerais: '', observacoes_embalagem: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDone) {
      geproService.getRecebimento(id).then(setRecebimento).catch(() => {});
    }
  }, [id, isDone]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.responsavel_recebimento || !form.numero_nf || !form.quantidade_recebida) {
      setError('Responsável, NF e quantidade são obrigatórios.');
      return;
    }
    setSaving(true); setError(null);
    try {
      await geproService.registrarRecebimento(id, { ...form, quantidade_recebida: Number(form.quantidade_recebida) } as any);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao registrar recebimento.');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive || isDone ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}>
        <div>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive || isDone ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}>{isDone ? '✓' : '2'}</span>
          Recebimento Provisório
        </div>
        {isDone && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Concluído</span>}
        {isActive && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Aguardando</span>}
      </div>

      {isDone && recebimento && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          <InfoRow label="Responsável"    value={recebimento.responsavel_recebimento} />
          <InfoRow label="Nota Fiscal"    value={recebimento.numero_nf} />
          <InfoRow label="Qtd. Recebida"  value={recebimento.quantidade_recebida} />
          <InfoRow label="Data Recebimento" value={fmtDate(recebimento.data_recebimento_provisorio)} />
          {recebimento.observacoes_gerais && <InfoRow label="Observações" value={recebimento.observacoes_gerais} />}
        </div>
      )}

      {isActive && (
        <div className="p-6">
          <FormError msg={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Responsável pelo Recebimento *</label>
              <input className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.responsavel_recebimento} onChange={e => set('responsavel_recebimento', e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Número da Nota Fiscal *</label>
              <input className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.numero_nf} onChange={e => set('numero_nf', e.target.value)} placeholder="Ex: NF-001234" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Quantidade Recebida *</label>
              <input type="number" min="1" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.quantidade_recebida} onChange={e => set('quantidade_recebida', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Data do Recebimento</label>
              <input type="date" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.data_recebimento_provisorio} onChange={e => set('data_recebimento_provisorio', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Observações Embalagem</label>
              <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[60px] resize-y" value={form.observacoes_embalagem} onChange={e => set('observacoes_embalagem', e.target.value)} placeholder="Estado da embalagem..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Observações Gerais</label>
              <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[60px] resize-y" value={form.observacoes_gerais} onChange={e => set('observacoes_gerais', e.target.value)} placeholder="Observações adicionais..." />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={submit} disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar Recebimento'}
            </button>
          </div>
        </div>
      )}

      {!isActive && !isDone && (
        <p className="p-6 text-slate-400 text-sm m-0 bg-slate-50/50 italic">Aguardando confirmação de agendamento.</p>
      )}
    </div>
  );
}

// ── Section 3: Testes Técnicos ────────────────────────────────────────────────

const RESULTADO_OPTIONS = [
  { value: 'conforme',    label: 'Conforme — todos os itens aprovados' },
  { value: 'com_desvios', label: 'Com Desvios — aprovado com ressalvas' },
  { value: 'nao_conforme',label: 'Não Conforme — reprovado' },
];

function TestesSection({ id, status, recebimento, onRefresh }: { id: string; status: string; recebimento: any; onRefresh: () => void }) {
  const isActive = status === 'recebimento_provisorio';
  const isDone   = statusGte(status, 'recebimento_testado_conforme') || status === 'recebimento_rejeitado';
  const [form, setForm] = useState({
    resultado_geral: '', responsavel_teste: '', descricao_desvios: '', acao_desvios: '',
    teste_funcionamento_basico: false, processador_validado: false,
    memoria_ram_validada: false, armazenamento_validado: false,
    conectividade_validada: false, software_licencas_validados: false,
    documentacao_validada: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.resultado_geral) { setError('Resultado geral é obrigatório.'); return; }
    if ((form.resultado_geral === 'com_desvios' || form.resultado_geral === 'nao_conforme') && !form.descricao_desvios) {
      setError('Descrição dos desvios é obrigatória para resultados com desvios ou não conformes.');
      return;
    }
    setSaving(true); setError(null);
    try {
      await geproService.registrarTestes(id, form as any);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao registrar testes.');
      setSaving(false);
    }
  };

  const checks = [
    { key: 'teste_funcionamento_basico',  label: 'Funcionamento Básico' },
    { key: 'processador_validado',        label: 'Processador' },
    { key: 'memoria_ram_validada',        label: 'Memória RAM' },
    { key: 'armazenamento_validado',      label: 'Armazenamento' },
    { key: 'conectividade_validada',      label: 'Conectividade (rede/USB)' },
    { key: 'software_licencas_validados', label: 'Software / Licenças' },
    { key: 'documentacao_validada',       label: 'Documentação inclusa' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive || isDone ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}>
        <div>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive || isDone ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}>{isDone ? '✓' : '3'}</span>
          Testes Técnicos
        </div>
        {isDone && status !== 'recebimento_rejeitado' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Concluído</span>}
        {status === 'recebimento_rejeitado' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-800">Reprovado</span>}
        {isActive && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Aguardando</span>}
      </div>

      {isDone && recebimento?.teste_tecnico && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          <InfoRow label="Resultado"    value={recebimento.teste_tecnico.resultado_geral} />
          <InfoRow label="Responsável"  value={recebimento.teste_tecnico.responsavel_teste} />
          <InfoRow label="Concluído em" value={fmtDate(recebimento.teste_tecnico.data_conclusao_testes)} />
          {recebimento.teste_tecnico.descricao_desvios && (
            <InfoRow label="Desvios" value={recebimento.teste_tecnico.descricao_desvios} />
          )}
        </div>
      )}

      {isActive && (
        <div className="p-6">
          <FormError msg={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Resultado Geral *</label>
              <select className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white" value={form.resultado_geral} onChange={e => set('resultado_geral', e.target.value)}>
                <option value="">Selecione...</option>
                {RESULTADO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Responsável pelo Teste</label>
              <input className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={form.responsavel_teste} onChange={e => set('responsavel_teste', e.target.value)} placeholder="Nome do técnico" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Itens Verificados</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
              {checks.map(c => (
                <div key={c.key} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id={c.key}
                    checked={(form as any)[c.key]}
                    onChange={e => set(c.key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor={c.key} className="text-sm text-slate-700 cursor-pointer select-none">{c.label}</label>
                </div>
              ))}
            </div>
          </div>

          {(form.resultado_geral === 'com_desvios' || form.resultado_geral === 'nao_conforme') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Descrição dos Desvios *</label>
                <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[70px] resize-y" value={form.descricao_desvios} onChange={e => set('descricao_desvios', e.target.value)} placeholder="Descreva os desvios encontrados..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Ação sobre os Desvios</label>
                <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[70px] resize-y" value={form.acao_desvios} onChange={e => set('acao_desvios', e.target.value)} placeholder="Ação tomada ou proposta..." />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={submit} disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar Testes'}
            </button>
          </div>
        </div>
      )}

      {!isActive && !isDone && (
        <p className="p-6 text-slate-400 text-sm m-0 bg-slate-50/50 italic">Aguardando recebimento provisório.</p>
      )}
    </div>
  );
}

// ── Section 4: Encerramento ───────────────────────────────────────────────────

function EncerramentoSection({ id, status, onRefresh }: { id: string; status: string; onRefresh: () => void }) {
  const canRegister  = status === 'recebimento_testado_conforme';
  const canFinalizar = status === 'encerramento_pagamento_realizado';
  const isDone       = status === 'encerramento_finalizado';
  const isActive     = canRegister || canFinalizar || isDone;
  const [encerramento, setEncerramento] = useState<any>(null);

  const [regForm, setRegForm] = useState({ data_confirmacao_pagamento: '', numero_patrimonio_sga: '', observacoes_encerramento: '' });
  const [finForm, setFinForm] = useState({ relatorio_conclusao: '', licoes_aprendidas: '', recomendacoes_futuras: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isActive) {
      geproService.getEncerramento(id).then(setEncerramento).catch(() => {});
    }
  }, [id, isActive]);

  const setReg = (k: string, v: string) => setRegForm(f => ({ ...f, [k]: v }));
  const setFin = (k: string, v: string) => setFinForm(f => ({ ...f, [k]: v }));

  const submitReg = async () => {
    setSaving(true); setError(null);
    try {
      await geproService.registrarEncerramento(id, regForm as any);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao registrar encerramento.');
      setSaving(false);
    }
  };

  const submitFin = async () => {
    setSaving(true); setError(null);
    try {
      await geproService.finalizarDemanda(id, finForm as any);
      onRefresh();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao finalizar demanda.');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}>
        <div>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}>{isDone ? '✓' : '4'}</span>
          Encerramento
        </div>
        {isDone && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Finalizado</span>}
        {canRegister && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Aguardando confirmação de pagamento</span>}
        {canFinalizar && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Aguardando finalização</span>}
      </div>

      {(canFinalizar || isDone) && encerramento && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
          <InfoRow label="Confirmação de Pagamento" value={fmtDate(encerramento.data_confirmacao_pagamento)} />
          <InfoRow label="Patrimônio SGA"           value={encerramento.numero_patrimonio_sga} />
          <InfoRow label="Status Pagamento"         value={encerramento.status_pagamento} />
          {encerramento.observacoes_encerramento && <InfoRow label="Observações" value={encerramento.observacoes_encerramento} />}
          {isDone && encerramento.relatorio_conclusao && <InfoRow label="Relatório" value={encerramento.relatorio_conclusao} />}
          {isDone && encerramento.licoes_aprendidas   && <InfoRow label="Lições Aprendidas" value={encerramento.licoes_aprendidas} />}
          {isDone && encerramento.recomendacoes_futuras && <InfoRow label="Recomendações" value={encerramento.recomendacoes_futuras} />}
          {isDone && encerramento.data_finalizacao && <InfoRow label="Finalizado em" value={fmtDateTime(encerramento.data_finalizacao)} />}
        </div>
      )}

      {canRegister && (
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-5">Confirme o pagamento para iniciar o encerramento da demanda.</p>
          <FormError msg={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Data Confirmação de Pagamento</label>
              <input type="date" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={regForm.data_confirmacao_pagamento} onChange={e => setReg('data_confirmacao_pagamento', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Nº Patrimônio SGA</label>
              <input className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white" value={regForm.numero_patrimonio_sga} onChange={e => setReg('numero_patrimonio_sga', e.target.value)} placeholder="Número do patrimônio no SGA" />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Observações</label>
            <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y" value={regForm.observacoes_encerramento} onChange={e => setReg('observacoes_encerramento', e.target.value)} placeholder="Observações sobre o encerramento..." />
          </div>
          <div className="flex justify-end mt-2">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={submitReg} disabled={saving}>
              {saving ? 'Registrando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </div>
      )}

      {canFinalizar && (
        <div className="p-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-5">Finalize a demanda registrando o relatório de conclusão.</p>
          <FormError msg={error} />
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Relatório de Conclusão</label>
            <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y" value={finForm.relatorio_conclusao} onChange={e => setFin('relatorio_conclusao', e.target.value)} placeholder="Descreva os resultados alcançados..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Lições Aprendidas</label>
              <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y" value={finForm.licoes_aprendidas} onChange={e => setFin('licoes_aprendidas', e.target.value)} placeholder="O que pode ser melhorado..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Recomendações Futuras</label>
              <textarea className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y" value={finForm.recomendacoes_futuras} onChange={e => setFin('recomendacoes_futuras', e.target.value)} placeholder="Sugestões para próximas aquisições..." />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={submitFin} disabled={saving}>
              {saving ? 'Finalizando...' : 'Finalizar Demanda'}
            </button>
          </div>
        </div>
      )}

      {!isActive && (
        <p className="p-6 text-slate-400 text-sm m-0 bg-slate-50/50 italic">Aguardando conclusão dos testes técnicos.</p>
      )}
    </div>
  );
}

// ── Fase4Page ─────────────────────────────────────────────────────────────────

export default function Fase4Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [demanda, setDemanda] = useState<any>(null);
  const [recebimento, setRecebimento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const dem = await geproService.getDemanda(id);
      setDemanda(dem);
      const rec = await geproService.getRecebimento(id).catch(() => null);
      setRecebimento(rec);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Erro ao carregar demanda.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-slate-500 text-sm p-6 text-center">Carregando...</p>;
  if (error)   return <p className="text-red-600 text-sm p-6 text-center font-medium">{error}</p>;
  if (!demanda) return null;

  const status: string = demanda.status;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
        <Link to="/gepro/dashboard" className="hover:text-blue-600 transition-colors">← Dashboard</Link>
        {' / '}
        <Link to={`/gepro/demandas/${id}`} className="hover:text-blue-600 transition-colors">{demanda.numero_demanda}</Link>
        {' / Fase 4 — Entrega e Recebimento'}
      </p>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
          {demanda.titulo}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          {demanda.numero_demanda} · {demanda.tipo_equipamento} × {demanda.quantidade}
        </p>
      </div>

      <AgendamentoSection  id={id!} status={status} onRefresh={load} />
      <RecebimentoSection  id={id!} status={status} onRefresh={load} />
      <TestesSection       id={id!} status={status} recebimento={recebimento} onRefresh={load} />
      <EncerramentoSection id={id!} status={status} onRefresh={load} />

      {status === 'encerramento_finalizado' && (
        <div className="text-center p-8 bg-emerald-50 border border-emerald-200 rounded-xl mt-4 shadow-sm">
          <p className="mb-4 text-lg font-bold text-emerald-800">Demanda encerrada com sucesso!</p>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer" onClick={() => navigate('/gepro/dashboard')}>
            Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
