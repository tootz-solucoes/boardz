import CalendarGeral2026 from "../components/CalendarGeral2026";
import { CalendarDays } from "lucide-react";

function CalendarGeralPage() {
  return (
    <div className="content p-[0.75em_1em] max-w-[1800px] w-full h-screen flex flex-col items-center gap-[0.75em] box-border mx-auto overflow-hidden">
      <div className="flex justify-between gap-[1.2rem] flex-wrap w-full box-border flex-1 min-h-0">
        <div className="box-border grow flex min-h-0">
          <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] box-border overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.4)]">
            <header className="flex justify-between items-center mb-2">
              <h1 className="inline-flex items-center gap-[0.45rem]"><CalendarDays size={20} /> Calendário Geral 2026</h1>
            </header>
            <CalendarGeral2026 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarGeralPage;
