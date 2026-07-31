import type { ReactNode } from "react";

export default function ButtonsShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      {children}
    </div>
  );
}
