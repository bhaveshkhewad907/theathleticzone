import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  children: ReactNode;
}

export default function SectionCard({ title, description, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        bg-[#141427]
        border border-white/5
        rounded-2xl
        p-6 md:p-8
        shadow-xl
      "
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg md:text-xl font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-white/50 mt-1">{description}</p>
          )}
        </div>
      )}

      {children}
    </motion.div>
  );
}
