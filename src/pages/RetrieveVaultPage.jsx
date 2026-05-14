import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { extractCode } from '../utils/format'

export default function RetrieveVaultPage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const code = extractCode(value)
    if (!code) return
    navigate(`/s/${code}`)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-pink-100 p-3 text-pink-500">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Open a share</h1>
            <p className="mt-1 text-sm text-slate-600">Enter a retrieval code or paste the shareable URL.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="AX72K or https://.../s/AX72K"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-300"
          />
          <Button type="submit" className="w-full py-3 text-base">
            Open share
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
