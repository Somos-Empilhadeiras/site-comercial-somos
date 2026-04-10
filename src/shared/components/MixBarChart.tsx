// components/MixBarChart.tsx
'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 text-sm space-y-1">
      <p className="font-black text-slate-700 uppercase text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span className="text-gray-500">{p.name}</span>
          <span className="font-bold" style={{ color: p.fill }}>
            {p.name === 'Conversão' ? `${p.value}%` : formatCurrency(p.value)}
          </span>
        </div>
      ))}
      {payload[0]?.payload?.totalPropostas > 0 && (
        <p className="text-gray-400 text-xs pt-1 border-t border-gray-50">
          {payload[0].payload.totalPropostas} proposta(s) no mês
        </p>
      )}
    </div>
  );
};

export default function MixBarChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-black text-slate-800 uppercase text-sm">Desempenho por Mês</h2>
          <p className="text-gray-400 text-xs mt-0.5">Venda · Locação · Meta · Conversão</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ left: 16, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis
            type="number"
            tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
          />

          <Bar dataKey="vendas"      name="Vendas"    fill="#22c55e" radius={[0, 6, 6, 0]} maxBarSize={18} />
          <Bar dataKey="locacao"     name="Locação"   fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={18} />
          <Bar dataKey="metaVendas"  name="Meta V."   fill="#bbf7d0" radius={[0, 6, 6, 0]} maxBarSize={18} />
          <Bar dataKey="metaLocacao" name="Meta L."   fill="#bfdbfe" radius={[0, 6, 6, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>

      {/* Cards de Taxa de Conversão por mês */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {data.map((d) => (
          <div key={d.month} className="bg-slate-50 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">{d.month}</p>
            <p className={`text-2xl font-black mt-1 ${d.taxaConversao >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
              {d.taxaConversao}%
            </p>
            <p className="text-[10px] text-gray-400">conversão</p>
          </div>
        ))}
      </div>
    </div>
  );
}