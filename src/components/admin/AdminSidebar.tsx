"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutDashboard, Settings, PackageOpen, Users, Receipt } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/menu", label: "Gestor de Menú", icon: Coffee },
    { href: "/admin/inventory", label: "Inventario", icon: PackageOpen },
    { href: "/admin/orders", label: "Historial de Órdenes", icon: Receipt },
    { href: "/admin/staff", label: "Personal", icon: Users },
    { href: "/admin/settings", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="w-64 bg-stone-950 text-stone-300 flex flex-col h-full border-r border-stone-800">
      <div className="p-6 border-b border-stone-800/50">
        <div className="font-serif text-2xl text-white italic font-bold">Aura</div>
        <div className="text-xs font-semibold tracking-[0.2em] text-stone-500 mt-1">BACKOFFICE</div>
      </div>
      <div className="flex-1 py-6 px-3 space-y-1">
        {links.map(link => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-amber-600/10 text-amber-500 font-bold' : 'hover:bg-stone-900 hover:text-white'}`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-stone-800/50 text-xs text-stone-500 text-center">
        Coffee OS Enterprise v1.0
      </div>
    </div>
  );
}
