import type { ReactNode } from "react";

export default function SubtitleSmall({ children }: { children: ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}
