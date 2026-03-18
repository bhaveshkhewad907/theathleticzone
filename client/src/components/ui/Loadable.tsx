import { Suspense } from "react";
import type { ElementType } from "react";

// 1. The Premium Loading Spinner
export const SuspenseLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
  </div>
);

// 2. The Wrapper Function
export const Loadable = (Component: ElementType) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component />
  </Suspense>
);
