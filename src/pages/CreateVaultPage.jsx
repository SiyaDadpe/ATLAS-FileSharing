import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { Copy, LoaderCircle, Sparkles, Link2, ShieldCheck } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import FileDropzone from '../components/FileDropzone'
import CopyButton from '../components/CopyButton'
import CountdownTimer from '../components/CountdownTimer'
import { createVault } from '../services/api'
import { buildVaultUrl, formatDateTime } from '../utils/format'
import { saveRecentVault } from '../utils/localVaults'
import { useToast } from '../components/ToastProvider'

const expiryOptions = [
  { value: '10m', label: '10 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: 'custom', label: 'Custom' },
]

export default function CreateVaultPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [passphrase, setPassphrase] = useState('')
  const [expiryType, setExpiryType] = useState('1d')
  const [customDurationValue, setCustomDurationValue] = useState('')
  const [customDurationUnit, setCustomDurationUnit] = useState('hours')
  const [files, setFiles] = useState([])
  const [oneTimeView, setOneTimeView] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const shareUrl = useMemo(() => (result ? buildVaultUrl(result.code) : ''), [result])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setProgress(0)
    try {
      const response = await createVault(
        {
          passphrase,
          expiryType,
          customDurationValue,
          customDurationUnit,
          files,
          oneTimeView,
        },
        (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total))
          }
        },
      )

      const data = response.data.data
      setResult(data)
      saveRecentVault({
        code: data.code,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
        oneTimeView: data.oneTimeView,
      })
      toast.success('Vault created')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create vault')
    } finally {
      setLoading(false)
    }
  }

  const expiresAt = result?.expiresAt
  const gridClass = result ? 'md:grid-cols-2' : 'md:grid-cols-1 md:justify-items-center'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-5xl grid gap-6 ${gridClass}`}>
        <Card className="flex flex-col justify-between h-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Text note removed per preference */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Files</label>
              <FileDropzone files={files} setFiles={setFiles} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={expiryType}
                onChange={(e) => setExpiryType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 outline-none focus:border-pink-300"
              >
                {expiryOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white">
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Optional secret phrase"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-300"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
              <input type="checkbox" checked={oneTimeView} onChange={(e) => setOneTimeView(e.target.checked)} className="h-4 w-4 rounded border-slate-300 bg-transparent text-pink-400" />
              <span className="block text-sm font-medium text-slate-700">One-time view</span>
            </label>

            <div>
              <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? 'Creating vault...' : 'Create vault'}
              </Button>
            </div>
          </form>
        </Card>

        {result && (
          <Card className="flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Vault created</h2>
              <p className="text-sm text-slate-700">Code</p>
              <p className="text-3xl font-bold text-violet-500 tracking-widest">{result.code}</p>
              <div className="flex items-center gap-3">
                <CopyButton value={shareUrl} label="Copy link" />
                <CopyButton value={result.code} label="Copy code" />
              </div>
              <div className="mt-4">
                <CountdownTimer expiresAt={result.expiresAt} />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
