import { useState, useContext } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Users,
  CalendarDays,
  Database,
  ShieldCheck,
  ScrollText,
  Activity,
} from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { motion } from "framer-motion";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth) return null;

  return (
    <div className="relative min-h-screen text-white flex flex-col md:flex-row font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* 🎬 FULL PAGE FIXED BACKGROUND */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[20%]"
        style={{
          backgroundImage: `url('https://media.theathleticzone.in/auth-bg-images/admin-bg.jpg')`,
        }}
      >
        {/* Deep Gradient Overlay (Darkens the image so text is readable) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1724]/50 via-[#0B0F14]/20 to-[#0F1724]/50 mix-blend-multiply" />

        {/* Ambient Radial Spotlights */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 blur-[100px] rounded-full mix-blend-screen" />

        {/* Cinematic Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Mobile Topbar (Glassmorphic) */}
      <header className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0F1724]/40 backdrop-blur-xl z-40 relative shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <span className="text-black font-black text-sm italic">AZ</span>
          </div>
          <span className="text-xs font-black tracking-tighter uppercase italic">
            Intelligence Hub
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/50 hover:text-amber-500 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Glassmorphic Aesthetic */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-[#0F1724]/40 backdrop-blur-2xl border-r border-white/5 flex flex-col p-8 transition-transform duration-500 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5),inset_-1px_0_0_rgba(255,255,255,0.02)]
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:z-20`}
      >
        {/* Branding Header */}
        <div className="mb-12 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-black font-black text-xl italic">AZ</span>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none">
                The Athletic
              </h2>
              <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500/80 mt-1">
                Zone • Intelligence
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 ml-3">
              Operations Hub
            </p>
            <nav className="flex flex-col gap-2">
              <MenuLink
                to="/admin"
                label="Performance Dashboard"
                icon={LayoutDashboard}
                setSidebarOpen={setSidebarOpen}
              />
              <MenuLink
                to="/admin/groups"
                label="Grouping Engine"
                icon={Users}
                setSidebarOpen={setSidebarOpen}
              />
              <MenuLink
                to="/admin/sessions"
                label="Operations Ledger"
                icon={CalendarDays}
                setSidebarOpen={setSidebarOpen}
              />
              <MenuLink
                to="/admin/manage-sports"
                label="Sector Registry"
                icon={Activity}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 ml-3">
              Growth & Talent
            </p>
            <nav className="flex flex-col gap-2">
              <MenuLink
                to="/admin/courses"
                label="Content Vault"
                icon={Database}
                setSidebarOpen={setSidebarOpen}
              />
              <MenuLink
                to="/admin/invite-coach"
                label="Access Control"
                icon={ShieldCheck}
                setSidebarOpen={setSidebarOpen}
              />
              <MenuLink
                to="/admin/invitations"
                label="Invite Registry"
                icon={ScrollText}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
          </div>

          <button
            onClick={auth.logout}
            className="flex items-center gap-3 px-4 py-3 mt-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all w-full text-[11px] font-black uppercase tracking-widest border border-transparent hover:border-red-500/20 active:scale-95"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>

        {/* Bottom Status Panel */}
        <div className="pt-8 border-t border-white/5 mt-auto hidden md:block">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                Admin Instance
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-white/80 tracking-widest">
              V.2.0.4-RELEASE
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto relative z-10 scrollbar-hide">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-12 max-w-[1400px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

// Reusable Navigation Link Component
function MenuLink({
  to,
  label,
  icon: Icon,
  setSidebarOpen,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `group relative px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
          isActive
            ? "bg-white/[0.05] border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            : "hover:bg-white/[0.03] border border-transparent text-white/40 hover:text-white/90"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] bg-amber-500 rounded-full transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
          />
          <Icon
            size={18}
            className={
              isActive
                ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "group-hover:text-white/80"
            }
          />
          <span
            className={`text-[11px] font-black uppercase tracking-widest relative z-10 transition-colors ${isActive ? "text-[#E5E7EB]" : ""}`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
