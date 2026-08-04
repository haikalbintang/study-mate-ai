import { NAV_ITEMS } from "../data/shared";
import { type ViewKey } from "../types/shared";

interface NavbarProps {
  activeView: ViewKey;
  setActiveView: (key: ViewKey) => void;
}

export default function NavBar({ activeView, setActiveView }: NavbarProps) {
  return (
    <div className="h-16.75 fixed bottom-0 left-0 z-50 bg-card w-full shadow-xl border-t border-border">
      <nav className="flex border-b border-border p-2 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              className={`flex-1 flex flex-col items-center gap-1 border-none py-2 px-1 rounded-lg cursor-pointer text-xs transition-colors duration-150 ease-out ${
                active
                  ? "bg-accent text-foreground font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground font-medium"
              }`}
              onClick={() => setActiveView(item.key)}
            >
              <span className="text-sm leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
