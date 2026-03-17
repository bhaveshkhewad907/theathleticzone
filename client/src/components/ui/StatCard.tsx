import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="relative group overflow-hidden rounded-2xl border border-white/5 bg-[#141427] p-6 transition-all duration-300"
    >
      {/* Glow Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-indigo-500/10 to-blue-500/20 opacity-0 group-hover:opacity-100 transition duration-300" />

      {/* Shadow Layer */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_0_0px_rgba(0,0,0,0)] group-hover:shadow-[0_15px_45px_rgba(124,58,237,0.25)] transition duration-300" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/50 text-sm">{label}</p>
          <p className="text-3xl font-semibold mt-3 tracking-tight">{value}</p>
        </div>

        {icon && <div className="text-purple-400 opacity-80">{icon}</div>}
      </div>
    </motion.div>
  );
}
