"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OrderType } from "@prisma/client";
import { useCartStore } from "@/store/useCartStore";
import { ProductCard, ProductWithModifiers } from "@/components/customer/ProductCard";
import { ModifierModal } from "@/components/customer/ModifierModal";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { Search, ShoppingBag, MapPin, Coffee, FlaskConical, Snowflake } from "lucide-react";
import { createPortal } from "react-dom";

export function CustomerMenuClient({ categories }: { categories: any[] }) {
  const searchParams = useSearchParams();
  const setTableId = useCartStore(state => state.setTableId);
  const setOrderType = useCartStore(state => state.setOrderType);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getSubtotal = useCartStore(state => state.getSubtotal);
  
  const [selectedProduct, setSelectedProduct] = useState<ProductWithModifiers | null>(null);
  const [isModifierOpen, setIsModifierOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [mesa, setMesaState] = useState<string | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("cart-header-portal"));
    
    const m = searchParams.get("mesa");
    if (m) {
      setMesaState(m);
      setTableId(m);
      setOrderType(OrderType.DINE_IN);
    }
  }, [searchParams, setTableId, setOrderType]);

  const handleCustomize = (product: ProductWithModifiers) => {
    setSelectedProduct(product);
    setIsModifierOpen(true);
  };

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const lowerQ = searchQuery.toLowerCase();
    
    return categories.map(cat => ({
      ...cat,
      products: cat.products.filter((p: any) => 
        p.name.toLowerCase().includes(lowerQ) || 
        (p.description && p.description.toLowerCase().includes(lowerQ))
      )
    })).filter(cat => cat.products.length > 0);
  }, [categories, searchQuery]);

  const displayCategories = searchQuery.trim() ? filteredCategories : categories.filter(c => c.id === activeCatId);

  return (
    <div className="w-full">
      
      {/* Smart Table Banner */}
      {mesa && (
        <div className="mb-8 p-4 bg-amber-50/50 backdrop-blur-md border border-amber-200/60 rounded-3xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">📍 Mesa {mesa} Conectada</h3>
            <p className="text-xs font-medium text-stone-500 mt-0.5">Bienvenido, tu pedido irá directo a la barra de baristas.</p>
          </div>
        </div>
      )}

      {/* Rueda de Métodos de Extracción (Visual Showcase) */}
      <div className="mb-12">
        <h3 className="font-serif text-2xl font-bold text-stone-900 mb-6">Métodos de Extracción</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-white p-5 rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <div className="bg-stone-50 group-hover:bg-amber-50 p-4 rounded-full transition-colors"><Coffee className="h-8 w-8 text-stone-700 group-hover:text-amber-700" /></div>
            <div>
              <p className="font-bold text-stone-900 text-sm">V60 / Pour Over</p>
              <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-wider">Notas claras, florales</p>
            </div>
          </div>
          <div className="group bg-white p-5 rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <div className="bg-stone-50 group-hover:bg-amber-50 p-4 rounded-full transition-colors"><FlaskConical className="h-8 w-8 text-stone-700 group-hover:text-amber-700" /></div>
            <div>
              <p className="font-bold text-stone-900 text-sm">Chemex</p>
              <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-wider">Cuerpo ligero y limpio</p>
            </div>
          </div>
          <div className="group bg-white p-5 rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <div className="bg-stone-50 group-hover:bg-amber-50 p-4 rounded-full transition-colors"><Coffee className="h-8 w-8 text-stone-700 group-hover:text-amber-700" /></div>
            <div>
              <p className="font-bold text-stone-900 text-sm">Espresso Bar</p>
              <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-wider">Cremoso e intenso</p>
            </div>
          </div>
          <div className="group bg-white p-5 rounded-[2rem] border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <div className="bg-stone-50 group-hover:bg-amber-50 p-4 rounded-full transition-colors"><Snowflake className="h-8 w-8 text-stone-700 group-hover:text-amber-700" /></div>
            <div>
              <p className="font-bold text-stone-900 text-sm">Nitro Cold Brew</p>
              <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-wider">24h infusión en frío</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Sticky Bar */}
      <div className="sticky top-[80px] z-40 bg-[#FBF9F5]/90 backdrop-blur-xl pb-6 pt-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCatId(cat.id); setSearchQuery(""); }}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCatId === cat.id && !searchQuery.trim()
                    ? 'bg-stone-900 text-white shadow-md border border-stone-900'
                    : 'bg-white text-stone-500 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72 shrink-0 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar cafés..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-white border border-stone-200/80 rounded-full text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-stone-100 text-stone-400 px-2 py-1 rounded-lg text-[10px] font-bold border border-stone-200">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {displayCategories.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <p>No encontramos productos para tu búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {displayCategories.map(cat => (
            <div key={cat.id}>
              {searchQuery.trim() && <h3 className="text-2xl font-bold text-stone-900 mb-6 font-serif">{cat.name}</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cat.products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onCustomize={handleCustomize} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModifierModal 
        product={selectedProduct} 
        isOpen={isModifierOpen} 
        onClose={() => setIsModifierOpen(false)} 
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Cart Button Portal into Header */}
      {portalTarget && createPortal(
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full pl-2 pr-5 py-1.5 transition-transform active:scale-95 shadow-[0_8px_20px_rgb(0,0,0,0.15)] group"
        >
          <div className="bg-stone-800 group-hover:bg-amber-600 transition-colors p-2 rounded-full relative">
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-extrabold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-stone-900 shadow-sm animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-sm font-bold tracking-wide">
            ${subtotal.toFixed(2)}
          </span>
        </button>,
        portalTarget
      )}
    </div>
  );
}
