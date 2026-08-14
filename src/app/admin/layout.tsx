import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: 'Admin Dashboard - Coffee OS',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#FAF8F5] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="absolute top-0 right-0 p-8 text-stone-300 font-serif italic text-4xl opacity-10 pointer-events-none">
          Aura Roastery Management
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
