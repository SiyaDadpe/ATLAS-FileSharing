export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
