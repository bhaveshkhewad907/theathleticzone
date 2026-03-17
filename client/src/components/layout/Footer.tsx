import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-transparent py-8 px-6 relative z-20 mt-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
        {/* Brand Section */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-[10px] flex items-center justify-center shadow-inner">
            <span className="text-amber-500 font-black text-lg italic tracking-tighter">
              AZ
            </span>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic text-white drop-shadow-md">
            The Athletic Zone
          </span>
        </div>

        {/* Legal Links Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link
            to="/terms"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] hover:text-amber-500 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] hover:text-amber-500 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/refund-policy"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] hover:text-amber-500 transition-colors"
          >
            Refund Policy
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.3em] text-center md:text-right">
          © {currentYear} The Athletic Zone. <br className="hidden lg:block" />{" "}
          All systems operational.
        </p>
      </div>
    </footer>
  );
}
