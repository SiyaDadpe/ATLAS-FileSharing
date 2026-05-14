import { Link, NavLink } from 'react-router-dom'
import { Shield, FolderPlus, Search } from 'lucide-react'
import Button from './Button'

export default function Navbar() {
  const linkClass = (path) => `rounded-full px-3 py-2 text-sm transition text-slate-600 hover:bg-white/80 hover:text-slate-800`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/create" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-violet-100 text-violet-500 ring-1 ring-pink-200">
            <Shield className="h-4 w-4" />
          </div>
            <div>
              <p className="font-semibold tracking-wide text-slate-800">Atlas</p>
            </div>
        </Link>

        <nav className="flex items-center gap-2">
            <NavLink to="/create" className={linkClass} end>
              Create Share
            </NavLink>
            <NavLink to="/retrieve" className={linkClass}>
              Open Share
            </NavLink>
        </nav>
      </div>
    </header>
  )
}
