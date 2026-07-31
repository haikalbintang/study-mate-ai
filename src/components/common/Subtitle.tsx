import { type ReactNode } from "react";

export default function Subtitle({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-xs text-[#9a988f] mt-0.5 capitalize
"
    >
      {children}
    </div>
  );
}
