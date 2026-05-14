import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'

export default function ExpiredPage() {
  const location = useLocation()
  const message = location.state?.message || 'This vault has expired or is unavailable.'

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-800">Vault expired</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/create"><Button>Create another vault</Button></Link>
          <Link to="/retrieve"><Button variant="secondary">Retrieve vault</Button></Link>
        </div>
      </Card>
    </div>
  )
}
