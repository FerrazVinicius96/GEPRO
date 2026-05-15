const fs = require('fs');
let code = fs.readFileSync('Fase4Page.tsx', 'utf8');

code = code.replace(/const S = \{[\s\S]*?\n\};\n/m, '');

const replacements = {
  'style={S.section}': 'className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm"',
  'style={S.sectionHeader(isActive || isDone)}': 'className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive || isDone ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}',
  'style={S.sectionHeader(isActive)}': 'className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 text-xs font-bold uppercase tracking-wide ${isActive ? "text-blue-900 bg-blue-50/50" : "text-slate-400 bg-slate-50"}`}',
  'style={S.step(isActive || isDone)}': 'className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive || isDone ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}',
  'style={S.step(isActive)}': 'className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${isActive ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-500"}`}',
  'style={S.badge(true)}': 'className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800"',
  'style={S.badge(false)}': 'className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800"',
  'style={{ ...S.badge(false), background: \'#fee2e2\', color: \'#991b1b\' }}': 'className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-800"',
  'style={S.input}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 bg-white"',
  'style={S.select}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white"',
  'style={S.textarea}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[80px] resize-y"',
  'style={{ ...S.textarea, minHeight: 60 }}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[60px] resize-y"',
  'style={{ ...S.textarea, minHeight: 70 }}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[70px] resize-y"',
  'style={S.label}': 'className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide"',
  'style={S.formGroup}': 'className="mb-5"',
  'style={S.row}': 'className="grid gap-5"',
  'style={S.btnPrimary}': 'className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"',
  'style={S.btn}': 'className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"',
  'style={S.btnDanger}': 'className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer"',
  'style={S.metaGrid}': 'className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6"',
  'style={S.metaLabel}': 'className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"',
  'style={S.metaValue}': 'className="text-sm font-medium text-slate-800"',
  'style={S.checkRow}': 'className="flex items-center gap-3 mb-2"',
  'style={{ color: \'#dc2626\', fontSize: 12, margin: \'0 0 12px\', padding: \'8px 12px\', background: \'#fef2f2\', border: \'1px solid #fecaca\', borderRadius: 3 }}': 'className="text-red-700 text-xs mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"',
  'style={{ padding: 20 }}': 'className="p-6"',
  'style={{ padding: 20, borderTop: \'1px solid #e5e7eb\' }}': 'className="p-6 border-t border-slate-200"',
  'style={{ ...S.row, gridTemplateColumns: \'1fr 1fr\', marginBottom: 14 }}': 'className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5"',
  'style={{ display: \'flex\', justifyContent: \'flex-end\' }}': 'className="flex justify-end mt-2"',
  'style={{ padding: 20, color: \'#9ca3af\', fontSize: 13, margin: 0 }}': 'className="p-6 text-slate-400 text-sm m-0 bg-slate-50/50 italic"',
  'style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'4px 0\' }}': 'className="grid grid-cols-1 md:grid-cols-2 gap-y-2"',
  'style={{ width: 14, height: 14, cursor: \'pointer\' }}': 'className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"',
  'style={{ fontSize: 12, color: \'#374151\', cursor: \'pointer\' }}': 'className="text-sm text-slate-700 cursor-pointer select-none"',
  'style={{ fontSize: 13, color: \'#4b5563\', marginBottom: 16 }}': 'className="text-sm text-slate-600 mb-5"',
  'style={{ maxWidth: 900 }}': 'className="max-w-5xl mx-auto"',
  'style={{ fontSize: 12, color: \'#9ca3af\', marginBottom: 20 }}': 'className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2"',
  'style={{ color: \'#9ca3af\', textDecoration: \'none\' }}': 'className="hover:text-blue-600 transition-colors"',
  'style={{ marginBottom: 24 }}': 'className="mb-8"',
  'style={{ margin: \'0 0 4px\', fontSize: 20, fontWeight: 700, color: \'#111827\' }}': 'className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1"',
  'style={{ margin: 0, fontSize: 12, color: \'#6b7280\' }}': 'className="text-sm font-medium text-slate-500"',
  'style={{ color: \'#6b7280\', fontSize: 13, padding: 24 }}': 'className="text-slate-500 text-sm p-6 text-center"',
  'style={{ color: \'#dc2626\', fontSize: 13, padding: 24 }}': 'className="text-red-600 text-sm p-6 text-center font-medium"',
  'style={{ textAlign: \'center\', padding: 24, background: \'#f0fdf4\', border: \'1px solid #86efac\', borderRadius: 4, marginTop: 8 }}': 'className="text-center p-8 bg-emerald-50 border border-emerald-200 rounded-xl mt-4 shadow-sm"',
  'style={{ margin: \'0 0 12px\', fontSize: 15, fontWeight: 700, color: \'#15803d\' }}': 'className="mb-4 text-lg font-bold text-emerald-800"',
  'style={{ marginBottom: 14 }}': 'className="mb-5"'
};

for (const [key, val] of Object.entries(replacements)) {
  code = code.split(key).join(val);
}

// Ensure InfoRow uses Tailwind
code = code.replace(/function InfoRow\(\{ label, value \}: \{ label: string; value: React\.ReactNode \}\) \{[\s\S]*?return \([\s\S]*?\<div\>[\s\S]*?\<div style=\{S\.metaLabel\}\>\{label\}\<\/div\>[\s\S]*?\<div style=\{S\.metaValue\}\>\{value \?\? '—'\}\<\/div\>[\s\S]*?\<\/div\>[\s\S]*?\);[\s\S]*?\}/m, `function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value ?? '—'}</div>
    </div>
  );
}`);

fs.writeFileSync('Fase4Page.tsx', code);
