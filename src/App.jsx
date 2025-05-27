import "./App.css";

import WeeklyPlanning from "./components/WeeklyPlanning";
import Lembrettz from "./components/Lembrettz";
import Efeittz from "./components/Efeittz";
import Betz from "./components/Betz";

function App() {
  return (
    <div className="content">
      <div className="row">
        <div className="col col-fill">
          <WeeklyPlanning />
        </div>
      </div>
      <div className="row">
        <div className="col col-fill">
          <Lembrettz />
        </div>
        <div className="col col-25">
          <Efeittz />
        </div>
        <div className="col col-25">
          <Betz />
        </div>
      </div>
    </div>
  );
}

export default App;
