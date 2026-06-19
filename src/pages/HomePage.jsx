import SprintProgress from "../components/SprintProgress";
import Lembrettz from "../components/Lembrettz";
import Betz from "../components/Betz";

function HomePage() {
  return (
    <div className="content p-[0.75em_1em] max-w-[1800px] w-full h-screen flex flex-col items-center gap-[0.75em] box-border mx-auto overflow-hidden">
      <div className="flex justify-between gap-[1.2rem] flex-wrap w-full box-border min-h-0" style={{ flex: "3" }}>
        <div className="box-border grow flex min-h-0">
          <SprintProgress />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-[1.2rem] w-full box-border min-h-0" style={{ flex: "1" }}>
        <div className="box-border flex-[1_1_0] flex min-h-0 min-w-0">
          <Lembrettz />
        </div>
        <div className="box-border flex-[1_1_0] flex min-h-0 min-w-0">
          <Betz />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
