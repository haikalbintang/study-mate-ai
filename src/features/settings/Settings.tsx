import { MODES } from "@/data/shared";

export default function Settings() {
  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4] text-center">
        <div>
          <div
            className="flex items-start justify-between mb-3
"
          >
            <span
              className="text-[15px] font-semibold text-[#2b2a26]
"
            >
              Pengaturan durasi
            </span>
          </div>

          <div className="pt-5 border-t border-[#ececE4] flex flex-col gap-2.5 text-left">
            {MODES.map((mode) => (
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: mode.color }}>
                  {mode.label}
                </span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={0}
                  className="w-14 py-1 px-1.5 rounded-md border border-[#d8d6cd] text-sm text-center"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
