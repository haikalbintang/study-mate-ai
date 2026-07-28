type ModeKey = 0 | 1 | 2;

interface ModeConfig {
  key: ModeKey;
  label: string;
  minutes: number;
  color: string;
}

const MODES: ModeConfig[] = [
  { key: 0, label: "Focus", minutes: 25, color: "#c25b3a" },
  { key: 1, label: "Short Break", minutes: 5, color: "#3a7d63" },
  { key: 2, label: "Long Break", minutes: 15, color: "#3a5f7d" },
];

export default function Timeline() {
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <div>
          <div
            className="flex items-start justify-between mb-3
"
          >
            <div>
              <div
                className="text-[15px] font-semibold text-[#2b2a26]
"
              >
                Timeline hari ini
              </div>
              <div
                className="text-xs text-[#9a988f] mt-0.5 capitalize
"
              >
                selasa, 28 juli
              </div>
            </div>
            <button
              className="bg-none border-none text-[#9a988f] text-xs cursor-pointer p-0
"
            >
              Bersihkan
            </button>
          </div>

          <div
            className="flex gap-3.5 mb-3 flex-wrap
"
          >
            {MODES.map((mode) => (
              <div
                key={mode.key}
                className="flex items-center gap-1.25 text-[11px] text-[#5a5850]
"
              >
                <span
                  className="w-2 h-2 rounded-full inline-block
"
                  style={{ backgroundColor: mode.color }}
                />
                {mode.label}
              </div>
            ))}
          </div>

          <div
            className="inline-block text-[11px] text-[#9a7b2f] bg-[#faf1dc] rounded-md px-2 py-1 mb-3
"
          >
            Contoh tampilan — belum ada sesi hari ini
          </div>

          <div
            className="max-h-105 overflow-y-auto border border-[#ececE4] rounded-xl bg-[#fbfaf7] pt-6
"
          >
            <div className="relative" style={{ height: `${24 * 52}px` }}>
              {Array.from({ length: 25 }, (_, hour) => (
                <div
                  key={hour}
                  className="absolute left-1 right-2 h-7 flex items-start 
"
                  style={{
                    top: `${hour === 25 ? hour * 52 - 26 : hour * 52}px`,
                  }}
                >
                  <span
                    className="w-6 shrink-0 text-[11px] text-[#a4a296] text-right pr-2 -translate-y-2
"
                  >
                    {hour <= 24 ? hour : ""}
                  </span>
                  <div
                    className="flex-1 border-t border-[#deded3] mt-0
"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
