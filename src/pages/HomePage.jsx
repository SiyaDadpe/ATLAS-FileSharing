import { ArrowRight, Shield, Timer, Unlock, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import RecentVaults from '../components/RecentVaults'

const features = [
  {
    icon: <UploadCloud className="h-5 w-5" />,
    title: 'Anonymous uploads',
    text: 'Upload files, videos, PDFs, documents, ZIPs, or text notes without making an account.',
  },
  {
    icon: <Timer className="h-5 w-5" />,
    title: 'Temporary by design',
    text: 'Choose when your vault expires. Expired vaults are deleted when someone tries to open them.',
  },
  {
    icon: <Unlock className="h-5 w-5" />,
    title: 'Secure retrieval',
    text: 'Share a short retrieval code and optionally protect the vault with a secret phrase.',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="animate-fadeUp">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm">
            <Shield className="h-4 w-4" />
            Anonymous temporary vaults for any device
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl">
            Store files and notes, then retrieve them later with a <span className="text-gradient">short code</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            TempVault is a lightweight temporary vault for public or shared devices. No signup. No account. Just upload, get a code, and open it from another device whenever you need it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create">
              <Button className="px-5 py-3 text-base">
                Create vault
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/retrieve">
              <Button variant="secondary" className="px-5 py-3 text-base">
                Retrieve vault
              </Button>
            </Link>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,192,203,0.28),_transparent_35%)]" />
          <div className="relative space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Example retrieval code</p>
              <p className="mt-2 text-4xl font-bold tracking-[0.35em] text-violet-500">AX72K</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm text-slate-500">What you get</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Drag and drop uploads</li>
                <li>• Optional secret phrase</li>
                <li>• Expiry countdown</li>
                <li>• File previews and downloads</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="transition hover:-translate-y-1 hover:border-pink-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
              {feature.icon}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-800">{feature.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{feature.text}</p>
          </Card>
        ))}
      </section>

      <RecentVaults />
    </div>
  )
}
