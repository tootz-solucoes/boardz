import Calendar2026 from "../components/Calendar2026";
import { CalendarDays } from "lucide-react";

function CalendarPage() {
  return (
    <div className="content p-[0.75em_1em] max-w-[1800px] w-full flex flex-col box-border mx-auto">
      <div className="rounded-2xl bg-bg-widget p-[1.2rem] box-border shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <header className="flex justify-between items-center mb-2">
          <h1 className="inline-flex items-center gap-[0.45rem]"><CalendarDays size={20} /> Calendário 2026</h1>
        </header>
        <Calendar2026 />
      </div>
    </div>
  );
}

export default CalendarPage;
