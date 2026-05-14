export default function Button({ className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm'
  const variants = {
    primary: 'bg-gradient-to-r from-pink-200 to-violet-200 text-slate-800 hover:from-pink-100 hover:to-violet-100 ring-1 ring-pink-200/60',
    secondary: 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-white',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
