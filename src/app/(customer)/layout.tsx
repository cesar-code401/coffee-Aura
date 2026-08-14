import Link from 'next/link';
import { Coffee, MapPin, Terminal, Activity } from 'lucide-react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FBF9F5] bg-[url('/noise.png')] bg-blend-multiply flex flex-col font-sans text-stone-900 selection:bg-amber-600/20">
      
      {/* Floating Capsule Navbar */}
      <div className="sticky top-4 z-50 px-4">
        <header className="max-w-6xl mx-auto bg-white/75 backdrop-blur-xl border border-stone-200/80 rounded-full px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-stone-900 text-white p-1.5 rounded-full group-hover:bg-amber-700 transition-colors shadow-sm">
              <Coffee className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif tracking-tight text-lg font-bold text-stone-900 leading-none">Aura</span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-stone-400 uppercase mt-0.5">Roastery & Lab</span>
            </div>
          </Link>
          
          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">Carta de Origen</Link>
            <a href="#metodos" className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">Métodos de Extracción</a>
            <Link href="/reservations" className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">Reservar Mesa</Link>
          </nav>
          
          {/* Right Area */}
          <div className="flex items-center gap-3">
            
            {/* Live Indicator Badge */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm text-emerald-700 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider border border-emerald-200/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Tostaduría Abierta
            </div>

            {/* Staff Terminal Dropdown */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-500 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors">
                <Terminal className="h-3 w-3" />
                <span>Staff</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-40 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 flex flex-col p-2 z-50">
                <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">Accesos Staff</div>
                <Link href="/pos" className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors flex items-center justify-between">
                  <span>POS Mostrador</span> <span className="text-lg">🖥️</span>
                </Link>
                <Link href="/kds" className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors flex items-center justify-between">
                  <span>KDS Cocina</span> <span className="text-lg">🔥</span>
                </Link>
              </div>
            </div>
            
            {/* Cart Portal Target */}
            <div id="cart-header-portal"></div>
          </div>

        </header>
      </div>

      <main className="flex-1 flex flex-col pt-4 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-stone-950 text-stone-400 py-16 mt-24 rounded-t-[3rem] relative z-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-amber-600" />
              <div className="flex flex-col">
                <span className="font-serif tracking-tight font-bold text-2xl text-white leading-none">Aura</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase mt-1">Roastery & Lab</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Cafetería de especialidad enfocada en microlotes únicos. Tostamos semanalmente para garantizar la máxima frescura en cada taza.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-stone-900 rounded-full text-xs border border-stone-800">☕ Specialty Coffee</span>
              <span className="px-3 py-1 bg-stone-900 rounded-full text-xs border border-stone-800">🌱 Granos Sustentables</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-white tracking-wide text-sm">Visítanos</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-stone-500 mt-0.5 shrink-0" />
                <span>Av. Principal 123, Barrio Bohemio<br/>Ciudad Mágica, CP 10000</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white tracking-wide text-sm">Horarios</h3>
            <ul className="space-y-2 text-sm text-stone-500">
              <li className="flex justify-between"><span>Lunes - Viernes</span> <span className="text-stone-300">08:00 - 21:00</span></li>
              <li className="flex justify-between"><span>Sábados</span> <span className="text-stone-300">09:00 - 22:00</span></li>
              <li className="flex justify-between"><span>Domingos</span> <span className="text-stone-300">09:00 - 18:00</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-stone-900 text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Aura Roastery & Lab.</p>
          <p className="text-stone-600 flex items-center gap-1"><Activity className="h-3 w-3"/> Desarrollado en Coffee OS</p>
        </div>
      </footer>
    </div>
  );
}
