interface Props {
  label: string;
  value: string | number;
  mono?: boolean;
}

export function StatCard({ label, value, mono = false }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold text-slate-900 ${
          mono ? 'font-mono text-lg' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
