import Title from "@/components/common/Title";
import { MODES } from "../../data/shared";
import usePomodoro from "@/hooks/usePomodoro";

export default function Dashboard() {
  const { completedFocusSessions } = usePomodoro();

  return (
    <div className="min-h-full w-full flex items-start md:items-center justify-center bg-[#f6f4ee] font-sans p-6 box-border">
      <div className="bg-white rounded-3xl pt-8 px-9 pb-7 w-90 max-w-full shadow-lg border border-[#ececE4]">
        <div>
          <Title>Today's Dashboard</Title>

          <div
            className="grid grid-cols-3 gap-2.5 mb-2 mt-3
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
                {completedFocusSessions}
              </div>
              <div
                className="text-[11px] text-[#9a988f] mt-1 leading-[1.3]
"
              >
                Focus session completed
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
                Total focus time
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
                Sessions stopped early
              </div>
            </div>
          </div>

          <div
            className="text-left text-xs font-semibold text-[#9a988f] uppercase tracking-[0.4px] my-6 mb-3
"
          >
            Time distribution today
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
            Total focus time: <strong>0 minutes</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
