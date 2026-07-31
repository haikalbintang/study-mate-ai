import type { ReactNode } from "react";

export default function Background({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      {children}
    </div>
  );
}
