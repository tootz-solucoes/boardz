import CalendarGeral2026 from "../components/CalendarGeral2026";
import "../App.css";

function CalendarGeralPage() {
  return (
    <div className="content">
      <div className="row">
        <div className="col col-fill">
          <div className="widget">
            <header>
              <h1>📅 Calendário Geral 2026</h1>
            </header>
            <CalendarGeral2026 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarGeralPage;
