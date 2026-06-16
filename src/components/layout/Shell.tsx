import React, { ReactNode } from "react";
import { User, UserRole } from "../../types";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ShellProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Shell({ user, onLogout, children, activeView, onNavigate }: ShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", role: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER] },
    { icon: ClipboardList, label: "รายงานการนิเทศ", id: "observations", role: [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.TEACHER] },
    { icon: Users, label: "จัดการข้อมูลครู", id: "teachers", role: [UserRole.ADMIN] },
    { icon: Calendar, label: "จัดการปีการศึกษา", id: "years", role: [UserRole.ADMIN] },
    { icon: Settings, label: "ตั้งค่าระบบ", id: "settings", role: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.role.includes(user.role));

  return (
    <div className="min-h-screen bg-dark-base flex text-text-primary">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 w-72 bg-dark-elevated text-text-primary z-50 shadow-2xl flex flex-col border-r border-dark-border"
          >
            <div className="p-6 border-b border-dark-border flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-inner overflow-hidden">
                <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-lg leading-tight truncate px-1 text-white">นิเทศออนไลน์</h2>
                <p className="text-gov-gold text-[10px] uppercase tracking-widest font-extrabold px-1">บ้านหนองหว้า</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              <div className="text-[10px] text-text-muted uppercase font-black mb-4 px-4 tracking-widest">Main Menu</div>
              {filteredMenu.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    activeView === item.id 
                    ? "bg-gov-gold/10 text-gov-gold border-r-2 border-gov-gold" 
                    : "hover:bg-white/5 text-text-secondary"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? "text-gov-gold" : "group-hover:text-gov-gold"}`} />
                  <span className={`font-semibold text-sm transition-colors ${activeView === item.id ? "text-white" : "group-hover:text-white"}`}>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 bg-black/20 mt-auto border-t border-dark-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full border border-gov-gold p-0.5 shadow-lg">
                  <div className="w-full h-full bg-dark-surface rounded-full flex items-center justify-center text-xs font-black text-gov-gold">
                    {user.fullname[0]}
                  </div>
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate text-white">{user.fullname}</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-800/40 text-red-400 py-2.5 rounded-xl transition-all text-sm font-bold border border-red-900/30"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "pl-72" : "pl-0"}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border-accent px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="ค้นหารายการนิเทศ..."
                className="pl-10 pr-4 py-2 bg-dark-base border border-dark-border rounded-full w-64 text-sm focus:ring-1 focus:ring-gov-gold outline-none text-text-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm lg:hidden">
                <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gov-gold rounded-full border border-dark-surface"></span>
            </button>
          </div>
        </header>

        <section className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          {children}
        </section>
      </main>
    </div>
  );
}
