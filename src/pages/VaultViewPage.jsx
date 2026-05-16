import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Download, FileText, Lock, RefreshCcw, ShieldCheck, Image as ImageIcon, Video, FileArchive, File as FileIcon, Eye, EyeOff } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import CopyButton from '../components/CopyButton'
import CountdownTimer from '../components/CountdownTimer'
import { fetchVault, unlockVault, consumeVault, toBackendUrl } from '../services/api'
import { buildVaultUrl, formatBytes, formatDateTime } from '../utils/format'
import { saveRecentVault } from '../utils/localVaults'
import { useToast } from '../components/ToastProvider'

function fileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
  if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />
  if (mimeType.includes('zip')) return <FileArchive className="h-5 w-5" />
  if (mimeType.includes('pdf') || mimeType.includes('text') || mimeType.includes('document')) return <FileText className="h-5 w-5" />
  return <FileIcon className="h-5 w-5" />
}

export default function VaultViewPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [vault, setVault] = useState(null)
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [consuming, setConsuming] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const shareUrl = useMemo(() => (vault ? buildVaultUrl(vault.code) : ''), [vault])

  useEffect(() => {
    async function loadVault() {
      setLoading(true)
      setError('')
      try {
        const response = await fetchVault(code)
        const data = response.data.data
        if (data.locked) {
          setLocked(true)
          setVault({ code: data.code, expiresAt: data.expiresAt })
          return
        }

        setVault(data)
        saveRecentVault({
          code: data.code,
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
          oneTimeView: data.oneTimeView,
        })
      } catch (err) {
        const status = err?.response?.status
        if (status === 410) {
          navigate('/expired', { replace: true, state: { message: 'This vault expired and was deleted.' } })
          return
        }
        if (status === 404) {
          navigate('/expired', { replace: true, state: { message: 'Vault not found.' } })
          return
        }
        setError(err?.response?.data?.message || 'Unable to load vault')
      } finally {
        setLoading(false)
      }
    }

    if (code) loadVault()
  }, [code, navigate])

  async function handleUnlock(event) {
    event.preventDefault()
    setUnlocking(true)
    try {
      const response = await unlockVault(code, passphrase)
      const data = response.data.data
      setLocked(false)
      setVault(data)
      saveRecentVault({
        code: data.code,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
        oneTimeView: data.oneTimeView,
      })
      toast.success('Vault unlocked')
    } catch (err) {
      if (err?.response?.status === 410) {
        navigate('/expired', { replace: true, state: { message: 'This vault expired and was deleted.' } })
        return
      }
      toast.error(err?.response?.data?.message || 'Incorrect secret phrase')
    } finally {
      setUnlocking(false)
    }
  }

  async function handleDone() {
    if (!vault?.oneTimeView) return
    setConsuming(true)
    try {
      await consumeVault(vault.code)
      navigate('/expired', { replace: true, state: { message: 'This vault was deleted after completion.' } })
    } catch (err) {
      if (err?.response?.status === 404) {
        navigate('/expired', { replace: true, state: { message: 'Vault not found.' } })
        return
      }
      toast.error(err?.response?.data?.message || 'Unable to delete vault')
    } finally {
      setConsuming(false)
    }
  }

  async function handleDownload(file) {
    if (!file?.file_url) return
    setDownloadingId(file.id)
    try {
      const response = await fetch(toBackendUrl(file.file_url), { credentials: 'omit' })
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = file.file_name || 'download'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      toast.error('Unable to download file')
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-10">
        <Card className="w-full max-w-xl text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-violet-400" />
          <p className="mt-4 text-lg text-slate-800">Loading vault...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <p className="text-lg text-slate-800">Something went wrong</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <div className="mt-6 flex gap-3">
            <Link to="/retrieve"><Button>Try again</Button></Link>
            <Link to="/"><Button variant="secondary">Home</Button></Link>
          </div>
        </Card>
      </div>
    )
  }

  if (locked && vault) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-500">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Vault locked</h1>
              <p className="mt-1 text-sm text-slate-600">This vault needs the secret phrase before access.</p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="mt-8 space-y-4">
            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter secret phrase"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 pr-12 text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-300"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase((value) => !value)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label={showPassphrase ? 'Hide secret phrase' : 'Show secret phrase'}
              >
                {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full py-3 text-base" disabled={unlocking}>
              {unlocking ? 'Unlocking...' : 'Unlock vault'}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <CountdownTimer expiresAt={vault.expiresAt} />
            <span>Code {vault.code}</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              Vault ready
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-800">{vault.code}</h1>
            <p className="mt-2 text-sm text-slate-600">Created {formatDateTime(vault.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <CountdownTimer expiresAt={vault.expiresAt} />
            <CopyButton value={shareUrl} label="Copy URL" />
            {vault.oneTimeView && (
              <Button type="button" className="px-4 py-2 text-xs" onClick={handleDone} disabled={consuming}>
                {consuming ? 'Deleting...' : 'Done'}
              </Button>
            )}
          </div>
        </div>

        {vault.oneTimeView && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This is a single-access share. Click Done when finished to delete it.
          </div>
        )}

        {vault.textContent && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-5 text-center">
            <p className="mb-2 text-sm font-medium text-slate-600">Text note</p>
            <p className="whitespace-pre-wrap leading-7 text-slate-700">{vault.textContent}</p>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-center gap-2 text-slate-600 sm:justify-start">
            <FileText className="h-4 w-4" />
            <h2 className="font-medium">Files</h2>
          </div>

          {vault.files?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {vault.files.map((file) => (
                <div key={file.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80">
                  {file.mime_type.startsWith('image/') ? (
                    <img src={toBackendUrl(file.file_url)} alt={file.file_name} className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-slate-50 text-violet-500">
                      <div className="text-center">
                        <div className="flex justify-center">{fileIcon(file.mime_type)}</div>
                        <p className="mt-3 text-sm text-slate-500">Preview unavailable</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-pink-100 p-2 text-pink-500">{fileIcon(file.mime_type)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{file.file_name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.file_size)} • {file.mime_type}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingId === file.id}
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === file.id ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-500">
              No files were uploaded with this share.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
