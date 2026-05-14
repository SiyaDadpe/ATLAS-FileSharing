export default function Card({ className = '', children }) {
  return <div className={`glass rounded-3xl p-5 text-slate-700 ${className}`}>{children}</div>
}
