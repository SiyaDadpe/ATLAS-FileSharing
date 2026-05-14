import useCountdown from '../hooks/useCountdown'

export default function CountdownTimer({ expiresAt }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(expiresAt)

  if (!expiresAt) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600">
      <span className={`h-2 w-2 rounded-full ${expired ? 'bg-rose-400' : 'bg-emerald-400'}`} />
      {expired ? 'Expired' : `Expires in ${days}d ${hours}h ${minutes}m ${seconds}s`}
    </div>
  )
}
