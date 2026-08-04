import type { ReactNode } from "react";

export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-[0.4px] mt-6 mb-3">
      {children}
    </div>
  );
}
