const fs = require('fs');
let code = fs.readFileSync('Fase2Page.tsx', 'utf8');

code = code.replace(/const S = \{[\s\S]*?\n\};\n/m, '');

const replacements = {
  'style={S.card}': 'className="bg-white border border-slate-200 rounded-xl mb-6 overflow-hidden shadow-sm"',
  'style={S.tabBar}': 'className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto custom-scrollbar"',
  'style={S.tabContent}': 'className="p-6"',
  'style={S.sectionTitle}': 'className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide"',
  'style={S.label}': 'className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide"',
  'style={S.input}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400"',
  'style={S.textarea}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[90px] resize-y"',
  'style={{ ...S.textarea, minHeight: 120 }}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[120px] resize-y"',
  'style={{ ...S.textarea, minHeight: 70 }}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[70px] resize-y"',
  'style={{ ...S.textarea, minHeight: 60 }}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 placeholder-slate-400 min-h-[60px] resize-y"',
  'style={S.select}': 'className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 bg-white"',
  'style={S.formGroup}': 'className="mb-5"',
  'style={S.formRow}': 'className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5"',
  'style={S.formRow3}': 'className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5"',
  'style={S.actionsRow}': 'className="flex gap-3 mt-6"',
  'style={S.btn}': 'className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"',
  'style={S.btnPrimary}': 'className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"',
  'style={S.btnSuccess}': 'className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"',
  'style={S.btnDanger}': 'className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer"',
  'style={S.table}': 'className="w-full border-collapse"',
  'style={S.th}': 'className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 bg-slate-50"',
  'style={S.td}': 'className="px-4 py-3 border-b border-slate-100 text-sm text-slate-600"',
  "style={S.tab(activeTab === key)}": "className={`px-6 py-4 cursor-pointer text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${activeTab === key ? 'text-blue-900 border-blue-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}",
  "style={S.alert('error')}": 'className="p-4 rounded-xl mb-6 text-sm bg-red-50 text-red-700 border border-red-200"',
  "style={S.alert('success')}": 'className="p-4 rounded-xl mb-6 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200"',
  "style={{ ...S.btn, fontSize: 11, padding: '6px 12px' }}": 'className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"',
  "style={S.badge('success')}": 'className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800"',
  "style={S.badge('pending')}": 'className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800"'
};

for (const [key, val] of Object.entries(replacements)) {
  code = code.split(key).join(val);
}

// Custom manual replaces safely
code = code.replace(/style=\{\{ \.\.\.S\.checkItem, borderColor: (.*?) \}\}/g, 'className={`flex items-start gap-4 p-4 border rounded-xl mb-3 ${$1 === false ? "border-red-300 bg-red-50" : $1 === null ? "border-slate-200" : "border-emerald-300 bg-emerald-50"}`}');

// Extra cleanup for manual styles left behind:
code = code.replace(/style=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 \}\}/g, 'className="flex justify-between items-center mb-4"');
code = code.replace(/style=\{\{ \.\.\.S\.sectionTitle, marginBottom: 16 \}\}/g, 'className="text-xs font-bold text-blue-900 mb-4 pb-3 border-b border-slate-200 uppercase tracking-wide"');
code = code.replace(/style=\{\{ border: '1px solid #e5e7eb', borderRadius: 4, padding: 16, marginBottom: 20, background: '#f9fafb' \}\}/g, 'className="border border-slate-200 rounded-xl p-6 mb-6 bg-slate-50 shadow-sm"');
code = code.replace(/style=\{\{ color: '#9ca3af', fontSize: 13, padding: '20px 0' \}\}/g, 'className="text-slate-400 text-sm py-5"');
code = code.replace(/style=\{\{ flex: 1 \}\}/g, 'className="flex-1"');
code = code.replace(/style=\{\{ fontSize: 16 \}\}/g, 'className="text-base"');
code = code.replace(/style=\{\{ fontSize: 13, color: '#374151', fontWeight: 500 \}\}/g, 'className="text-sm text-slate-700 font-medium"');
code = code.replace(/style=\{\{ fontSize: 11, color: '#6b7280', marginTop: 2 \}\}/g, 'className="text-xs text-slate-500 mt-0.5"');
code = code.replace(/style=\{\{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 2 \}\}/g, 'className="text-xs text-slate-400 italic mt-0.5"');
code = code.replace(/style=\{\{ marginTop: 24, padding: 16, background: checklist\.pode_avancar \? '#d1fae5' : '#fee2e2', borderRadius: 4, border: `1px solid \$\{checklist\.pode_avancar \? '#6ee7b7' : '#fca5a5'\}` \}\}/g, 'className={`mt-6 p-4 rounded-xl border ${checklist.pode_avancar ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}');
code = code.replace(/style=\{\{ fontSize: 14, fontWeight: 700, color: checklist\.pode_avancar \? '#065f46' : '#991b1b', marginBottom: 4 \}\}/g, 'className={`text-sm font-bold mb-1 ${checklist.pode_avancar ? "text-emerald-800" : "text-red-800"}`}');
code = code.replace(/style=\{\{ fontSize: 12, color: checklist\.pode_avancar \? '#047857' : '#b91c1c' \}\}/g, 'className={`text-xs ${checklist.pode_avancar ? "text-emerald-700" : "text-red-700"}`}');
code = code.replace(/style=\{\{ marginTop: 16, padding: '10px 14px', background: '#dbeafe', borderRadius: 4, fontSize: 13, color: '#1e40af', fontWeight: 600 \}\}/g, 'className="mt-4 px-4 py-3 bg-blue-50 rounded-xl text-sm text-blue-800 font-semibold border border-blue-200"');
code = code.replace(/style=\{\{ color: '#9ca3af', fontSize: 13 \}\}/g, 'className="text-slate-400 text-sm"');
code = code.replace(/style=\{\{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 \}\}/g, 'className="text-center p-16 text-slate-400 text-sm font-medium"');
code = code.replace(/style=\{\{ textAlign: 'center', padding: 60 \}\}/g, 'className="text-center p-16"');
code = code.replace(/style=\{\{ color: '#dc2626', marginBottom: 12 \}\}/g, 'className="text-red-600 mb-3 font-medium"');
code = code.replace(/style=\{\{ color: '#1e3a8a', fontSize: 13 \}\}/g, 'className="text-blue-900 text-sm font-bold hover:underline"');
code = code.replace(/style=\{\{ fontSize: 12, color: '#9ca3af', marginBottom: 24 \}\}/g, 'className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2"');
code = code.replace(/style=\{\{ color: '#9ca3af', textDecoration: 'none' \}\}/g, 'className="hover:text-blue-600 transition-colors"');
code = code.replace(/style=\{\{ padding: 20 \}\}/g, 'className="p-6"');
code = code.replace(/style=\{\{ fontFamily: 'monospace', fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 600 \}\}/g, 'className="font-mono text-xs text-slate-400 mb-1.5 font-semibold"');
code = code.replace(/style=\{\{ fontSize: 22, fontWeight: 700, color: '#1e3a8a', marginBottom: 6 \}\}/g, 'className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2"');
code = code.replace(/style=\{\{ fontSize: 13, color: '#6b7280', marginBottom: 16 \}\}/g, 'className="text-sm font-medium text-slate-500 mb-6"');
code = code.replace(/style=\{\{ display: 'grid', gridTemplateColumns: 'repeat\\(4, 1fr\\)', gap: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' \}\}/g, 'className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100"');
code = code.replace(/style=\{\{ marginTop: 12, color: '#92400e', fontSize: 12, background: '#fef3c7', padding: '8px 12px', borderRadius: 4 \}\}/g, 'className="mt-4 text-amber-800 text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 font-semibold"');

code = code.replace(/function metaItem\(label: string, value: string \| null \| undefined\) \{[\s\S]*?return \([\s\S]*?div style=\{\{ fontSize: 12 \}\}\>[\s\S]*?div style=\{\{ color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 \}\}\>\{label\}\<\/div\>[\s\S]*?div style=\{\{ color: '#374151', fontWeight: 600 \}\}\>\{value \|\| '—'\}\<\/div\>[\s\S]*?\<\/div\>[\s\S]*?\);[\s\S]*?\}/m, `function metaItem(label: string, value: string | null | undefined) {
  return (
    <div className="text-xs">
      <div className="text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-slate-800 font-bold">{value || '—'}</div>
    </div>
  );
}`);

fs.writeFileSync('Fase2Page.tsx', code);
