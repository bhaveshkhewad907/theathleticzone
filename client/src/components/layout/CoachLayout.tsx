import { useState, useContext } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Radio, Archive, User } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { motion } from "framer-motion";
import AuraBackground from "../../components/layout/AuraBackground"; // 🛡️ NEW: Import the Aura

export default function CoachLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth) return null;
  const userProfileImage = (auth.user as unknown as { profileImage?: string })
    ?.profileImage;
  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row font-sans selection:bg-amber-500/30 relative z-0">
      {/* 🚀 NEW: Dynamic Cinematic Background applied at the Layout Level */}
      <AuraBackground imageUrl={userProfileImage} />

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <span className="text-black font-black text-sm italic">AZ</span>
          </div>
          <span className="text-xs font-black tracking-tighter uppercase italic">
            Technical Command
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/50 hover:text-amber-500 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Coach Technical Command */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col p-8 transition-transform duration-500 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)]
        ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        {/* Branding Header */}
        <div className="mb-12 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="text-black font-black text-xl italic">AZ</span>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none text-white">
                Coach Portal
              </h2>
              <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500/80 mt-1">
                Technical • Lead
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 ml-3">
              Active Duty
            </p>
            <nav className="flex flex-col gap-2">
              <CoachMenuLink
                to="/coach/dashboard"
                label="Live Deployments"
                icon={Radio}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6 ml-3">
              Intelligence
            </p>
            <nav className="flex flex-col gap-2">
              <CoachMenuLink
                to="/coach/history"
                label="Performance Archive"
                icon={Archive}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
            <nav className="flex flex-col gap-2">
              <CoachMenuLink
                to="/coach/profile"
                label="Personal Profile"
                icon={User}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
          </div>

          <button
            onClick={auth.logout}
            className="flex items-center gap-3 px-4 py-3 mt-12 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all w-full text-[11px] font-black uppercase tracking-widest"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>

        {/* Coach Status Panel */}
        <div className="pt-8 border-t border-white/5 mt-auto hidden md:block">
          <div className="bg-[#0B0F14]/50 backdrop-blur-md rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                Status
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
            </div>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">
              Ready for Session
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* 🚀 UPGRADED: Removed static background image, allowed Aura to show through */}
      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto relative scrollbar-hide bg-transparent">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-12 max-w-[1200px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

// Custom Navigation Link for the Coach UI
function CoachMenuLink({
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
      end
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `group relative px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
          isActive
            ? "bg-white/[0.05] border border-white/10 text-white"
            : "hover:bg-white/[0.03] border border-transparent text-white/40 hover:text-white/80"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-amber-500 rounded-full transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
          />
          <Icon
            size={18}
            className={
              isActive ? "text-amber-500" : "group-hover:text-white/80"
            }
          />
          <span
            className={`text-[11px] font-black uppercase tracking-widest relative z-10 transition-colors ${isActive ? "text-amber-500" : ""}`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
