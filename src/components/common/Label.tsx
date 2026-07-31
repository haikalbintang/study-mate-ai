import type { ReactNode } from "react";

export default function YellowLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-block text-[11px] text-[#9a7b2f] bg-[#faf1dc] rounded-md px-2 py-1 mb-3
"
    >
      {children}
    </div>
  );
}
