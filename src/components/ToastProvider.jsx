import { createContext, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const api = useMemo(() => ({
    success(message) {
      addToast('success', message)
    },
    error(message) {
      addToast('error', message)
    },
    info(message) {
      addToast('info', message)
    },
  }), [])

  function addToast(type, message) {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`glass flex items-start gap-3 rounded-2xl px-4 py-3 ${
              toast.type === 'success'
                ? 'border-emerald-200'
                : toast.type === 'error'
                  ? 'border-rose-200'
                  : 'border-sky-200'
            }`}
          >
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'}`} />
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
            <button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return ctx
}
