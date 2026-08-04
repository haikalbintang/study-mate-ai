import { type ReactNode } from "react";

export default function Title({ children }: { children: ReactNode }) {
  return (
    <div className="text-[15px] font-semibold text-foreground">{children}</div>
  );
}
