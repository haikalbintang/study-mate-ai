import { MODES } from "../../data/shared";

export default function Dashboard() {
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <div>
          <div
            className="flex items-start justify-between mb-3
"
          >
            <span
              className="text-[15px] font-semibold text-[#2b2a26]
"
            >
              Dashboard hari ini
            </span>
          </div>

          <div
            className="grid grid-cols-3 gap-2.5 mb-2
"
          >
            <div
              className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center
"
            >
              <div
                className="text-af font-bold text-[#c25b3a]
"
              >
                0
              </div>
              <div
                className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]
"
              >
                Sesi focus selesai
              </div>
            </div>
            <div
              className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center
"
            >
              <div
                className="text-af font-bold text-[#2b2a26]
"
              >
                0m
              </div>
              <div
                className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]
"
              >
                Totoal waktu focus
              </div>
            </div>
            <div className="bg-[#f8f7f2] rounded-xl px-2 py-3.5 text-center">
              <div
                className="text-af font-bold text-[#2b2a26]
"
              >
                0
              </div>
              <div
                className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]
"
              >
                Sesi dihentikan
              </div>
            </div>
          </div>

          <div
            className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] my-6 mb-3
"
          >
            Distribusi waktu hari ini
          </div>
          <div
            className="flex flex-col gap-2.5
"
          >
            {MODES.map((mode) => (
              <div
                key={mode.key}
                className="flex items-center gap-2.5 text-xs
"
              >
                <div
                  className="w-20.5 text-[#5a5850] shrink-0
"
                >
                  {mode.label}
                </div>
                <div
                  className="flex-1 h-2 rounded-sm bg-[#f0efe9] overflow-hidden
"
                >
                  <div
                    className="h-full rounded-sm transition-all duration-400 ease-out"
                    style={{ backgroundColor: mode.color }}
                  />
                </div>
                <div
                  className="w-8.5 text-right text-[#9a988f] shrink-0
"
                >
                  0m
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-5 pt-4 border-t border-[#ececE4] text-xs text-[#9a988f]
"
          >
            Total waktu focus sepanjang waktu: <strong>0 menit</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
