import { Copy } from 'lucide-react'
import Button from './Button'
import { useToast } from './ToastProvider'

export default function CopyButton({ value, label = 'Copy' }) {
  const toast = useToast()

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} className="text-xs sm:text-sm">
      <Copy className="h-4 w-4" />
      {label}
    </Button>
  )
}
