import Calendar2026 from "../components/Calendar2026";
import { CalendarDays } from "lucide-react";
import "../App.css";

function CalendarPage() {
  return (
    <div className="content">
      <div className="row">
        <div className="col col-fill">
          <div className="widget">
            <header>
              <h1 className="title-with-icon"><CalendarDays size={20} /> Calendário 2026</h1>
            </header>
            <Calendar2026 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
