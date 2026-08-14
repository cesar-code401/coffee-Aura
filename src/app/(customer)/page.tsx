import { prisma } from "@/lib/prisma";
import { CustomerMenuClient } from "./CustomerMenuClient";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Star, Coffee, Zap, User, Clock, Flame, Droplets } from "lucide-react";
import { Suspense } from "react";
export const revalidate = 60; // Revalidate every minute

export default async function CustomerMenuPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { isActive: true },
        include: {
          modifierGroups: {
            include: {
              modifierGroup: {
                include: { options: true }
              }
            }
          }
        }
      }
    }
  });

  return (
    <>
      {/* Asymmetric Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-20 min-h-[85vh] flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Ambient Warm Glow behind the hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:-translate-x-0 lg:-top-20 lg:-right-20 lg:left-auto w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Left Column: Narrative */}
        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10 w-full relative">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-amber-200/60 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
            <span className="text-base leading-none">✨</span> Cosecha 2026 • Microlotes Geisha & Bourbon 88.5 SCA
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-stone-900 font-bold">
            El arte del café perfecto, extraído al <span className="font-serif italic font-medium text-amber-800">milímetro.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 max-w-xl leading-relaxed">
            Una experiencia sensorial diseñada para paladares exigentes. 
            Descubre perfiles de taza con notas florales, acidez brillante y un cuerpo sedoso, gracias a nuestro tostado artesanal de precisión.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <a href="#menu-section" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-stone-900 hover:bg-amber-900 text-white rounded-full px-8 h-14 text-base font-semibold shadow-[0_8px_20px_rgb(0,0,0,0.15)] transition-all hover:-translate-y-0.5">
                Explorar la Carta <ArrowDown className="h-4 w-4 opacity-70" />
              </button>
            </a>
            <Link href="/reservations" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 h-14 rounded-full text-stone-800 font-semibold border border-stone-300 bg-white/50 backdrop-blur-md hover:bg-white hover:shadow-sm transition-all hover:-translate-y-0.5">
                Reservar Experiencia
              </button>
            </Link>
          </div>

          {/* Luxury Social Proof */}
          <div className="pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              {/* Avatars */}
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-stone-200 overflow-hidden flex items-center justify-center">
                  <User className="h-5 w-5 text-stone-400" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-stone-300 overflow-hidden flex items-center justify-center">
                  <User className="h-5 w-5 text-stone-500" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-stone-400 overflow-hidden flex items-center justify-center">
                  <User className="h-5 w-5 text-stone-600" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF8F5] bg-stone-800 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                  +1.4k
                </div>
              </div>
              <div className="text-xs font-semibold text-stone-600 leading-tight">
                <span className="text-amber-600 text-sm">★</span> 4.98 <br/>
                <span className="text-stone-500 font-medium">De 1,400+ catadores este mes</span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-stone-200" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
                <Coffee className="h-3 w-3 text-amber-700" /> 100% Arábica de Altura
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
                <Flame className="h-3 w-3 text-amber-700" /> Tostado hace 48h
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
                <Droplets className="h-3 w-3 text-amber-700" /> Agua Remineralizada
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Bento Grid Showcase */}
        <div className="flex-1 w-full relative h-[550px] sm:h-[650px] lg:h-[750px] animate-in fade-in zoom-in-95 duration-1000 delay-150 z-20">
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-200/60 bg-stone-100">
            <Image 
              src="/images/products/latte.jpg" 
              alt="Luxury Pour Over / Latte Art" 
              fill 
              className="object-cover scale-105 hover:scale-100 transition-transform duration-[15s] ease-out"
              priority
            />
          </div>
          
          {/* Floating Card 1: Pure Glassmorphism (Tasting Notes) */}
          <div className="absolute top-10 -left-2 sm:-left-8 md:-left-12 bg-white/85 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 flex flex-col gap-2 max-w-[280px] animate-in slide-in-from-left-4 duration-700 delay-500">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-2xl border border-amber-200/50">
                <Star className="h-4 w-4 fill-amber-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Puntuación: 89 SCA</p>
            </div>
            <p className="text-[13px] font-medium text-stone-800 leading-snug">
              <span className="font-bold">Notas:</span> Jazmín, Miel de Azahar & Chocolate Amargo.
            </p>
          </div>

          {/* Floating Card 2: Interactive Dark Card (Live Status) */}
          <div className="absolute bottom-10 -right-2 sm:-right-4 md:-right-8 bg-stone-950/90 backdrop-blur-md text-white border border-stone-800 shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-3xl p-4 max-w-[280px] animate-in slide-in-from-right-4 duration-700 delay-700 hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-800 to-stone-700" />
                <Coffee className="h-5 w-5 text-amber-500 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white leading-tight tracking-wide">Pedido QR Mesa 4 en barra</p>
                <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-wider">Tiempo estimado: 3 min</p>
              </div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="max-w-7xl mx-auto px-4 w-full py-16 md:py-24 scroll-mt-20 z-20 relative">
        <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="animate-spin h-8 w-8 border-2 border-stone-900 rounded-full border-t-transparent"></div></div>}>
          <CustomerMenuClient categories={categories as any} />
        </Suspense>
      </section>
    </>
  );
}
