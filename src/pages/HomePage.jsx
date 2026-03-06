import WeeklyPlanning from "../components/WeeklyPlanning";
import Lembrettz from "../components/Lembrettz";
import { AniversariantesMesWidget } from "../components/CalendarGeral2026/AniversarianttzWidget";
import Betz from "../components/Betz";

function HomePage() {
  return (
    <div className="content">
      <div className="row">
        <div className="col col-fill">
          <WeeklyPlanning />
        </div>
      </div>
      <div className="row row-widgets">
        <div className="col col-equal">
          <Lembrettz />
        </div>
        <div className="col col-equal">
          <AniversariantesMesWidget />
        </div>
        <div className="col col-equal">
          <Betz />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
