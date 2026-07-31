import type { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4] text-center">
      {children}
    </div>
  );
}
