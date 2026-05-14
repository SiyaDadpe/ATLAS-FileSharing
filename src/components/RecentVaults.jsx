import { Link } from 'react-router-dom'
import { getRecentVaults } from '../utils/localVaults'
import Card from './Card'

export default function RecentVaults() {
  const recent = getRecentVaults()

  if (!recent.length) return null

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Recent vaults</h3>
          <p className="text-sm text-slate-600">Saved locally on this device only.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {recent.map((vault) => (
          <Link key={vault.code} to={`/vault/${vault.code}`} className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-pink-200 hover:bg-white">
            <p className="text-sm text-slate-700">{vault.code}</p>
            <p className="mt-1 text-xs text-slate-500">Expires {vault.expiresAt ? new Date(vault.expiresAt).toLocaleString() : 'soon'}</p>
          </Link>
        ))}
      </div>
    </Card>
  )
}
