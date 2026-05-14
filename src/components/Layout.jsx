import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,192,203,0.35),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(196,181,253,0.26),_transparent_25%)]">
      <Navbar />
      <main>{children}</main>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  )
}
