import SprintProgress from "../components/SprintProgress";
import Lembrettz from "../components/Lembrettz";
import Betz from "../components/Betz";

function HomePage() {
  return (
    <div className="content">
      <div className="row row-grow" style={{ flex: "3" }}>
        <div className="col col-fill">
          <SprintProgress />
        </div>
      </div>
      <div className="row row-widgets row-grow" style={{ flex: "2" }}>
        <div className="col col-equal">
          <Lembrettz />
        </div>
        <div className="col col-equal">
          <Betz />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
