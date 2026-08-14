import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  categories: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  onProductClick: (product: any) => void;
}

export function ProductGrid({
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onProductClick
}: ProductGridProps) {
  
  // Flatten and filter products
  let displayProducts = categories.flatMap(c => c.products);
  
  if (selectedCategory) {
    const cat = categories.find(c => c.id === selectedCategory);
    if (cat) displayProducts = cat.products;
  }

  if (searchQuery) {
    displayProducts = displayProducts.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r">
      {/* Top Header / Search */}
      <div className="p-4 bg-white dark:bg-slate-950 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search products... (Press Ctrl+F)" 
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Badge 
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer text-sm py-1.5 px-4 whitespace-nowrap"
            onClick={() => setSelectedCategory(null)}
          >
            All Products
          </Badge>
          {categories.map(cat => (
            <Badge 
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer text-sm py-1.5 px-4 whitespace-nowrap"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-24">
          {displayProducts.map((product: any) => (
            <div 
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-95 flex flex-col overflow-hidden h-32"
            >
              {product.imageUrl ? (
                <div className="h-16 w-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
              ) : (
                <div className="h-10 w-full bg-slate-100 dark:bg-slate-700" />
              )}
              <div className="p-2 flex-1 flex flex-col justify-between">
                <span className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</span>
                <span className="text-primary font-bold text-sm">${product.basePrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {displayProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No products found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
