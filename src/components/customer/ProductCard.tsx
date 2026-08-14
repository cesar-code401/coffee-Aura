import { Product, ModifierGroup, ModifierOption, ProductModifierGroup } from "@prisma/client";

export type ProductWithModifiers = Product & {
  modifierGroups: (ProductModifierGroup & {
    modifierGroup: ModifierGroup & {
      options: ModifierOption[];
    };
  })[];
};

interface ProductCardProps {
  product: ProductWithModifiers;
  onCustomize: (product: ProductWithModifiers) => void;
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  // Mock specs based on product category or name for luxury feel
  const getSpecs = (name: string) => {
    if (name.toLowerCase().includes('latte') || name.toLowerCase().includes('espresso')) {
      return { origin: 'Finca La Esperanza', process: 'Lavado', roast: 'Medio' };
    }
    if (name.toLowerCase().includes('brew') || name.toLowerCase().includes('filtro')) {
      return { origin: 'Etiopía Yirgacheffe', process: 'Natural', roast: 'Claro' };
    }
    return null;
  };

  const specs = getSpecs(product.name);

  return (
    <div 
      className="group bg-white rounded-[2rem] p-3 border border-stone-100 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden" 
      onClick={() => onCustomize(product)}
    >
      
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-stone-100 mb-5">
        {product.imageUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-[10s] ease-out" 
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <span className="font-serif">Aura Roastery</span>
          </div>
        )}
        
        {/* Inner shadow overlay for image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Price Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-900 shadow-[0_4px_12px_rgb(0,0,0,0.1)] border border-white/50">
          ${product.basePrice.toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-stone-900 mb-1.5 font-serif tracking-tight">{product.name}</h3>
        
        {product.description && (
          <p className="text-[13px] text-stone-500 line-clamp-2 leading-relaxed mb-4 font-medium">
            {product.description}
          </p>
        )}

        {/* Technical Specs Tags (Luxury feature) */}
        {specs && (
          <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
            <span className="bg-stone-50 border border-stone-100 text-stone-500 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
              Origen: {specs.origin}
            </span>
            <span className="bg-stone-50 border border-stone-100 text-stone-500 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
              Proceso: {specs.process}
            </span>
            <span className="bg-stone-50 border border-stone-100 text-stone-500 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
              Tueste: {specs.roast}
            </span>
          </div>
        )}
        
        {/* Minimal Add Button */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-amber-700/70 uppercase tracking-widest">
            {product.modifierGroups.length > 0 ? 'Configurable' : 'Selección Directa'}
          </span>
          <button 
            className="h-8 px-4 bg-stone-900 text-white text-[11px] uppercase tracking-widest font-bold rounded-full transition-transform active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 group-hover:bg-amber-700"
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(product);
            }}
          >
            + Añadir
          </button>
        </div>
      </div>
      
    </div>
  );
}
