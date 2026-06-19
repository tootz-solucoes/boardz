import SprintProgress from "../components/SprintProgress";
import Lembrettz from "../components/Lembrettz";
import Betz from "../components/Betz";

function HomePage() {
  return (
    <div className="content p-[0.75em_1em] max-w-[1800px] w-full h-screen flex gap-[1.2rem] box-border mx-auto overflow-hidden">
      <div className="flex-2 min-h-0 flex">
        <SprintProgress />
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-[1.2rem]">
        <div className="flex-1 min-h-0 flex">
          <Lembrettz />
        </div>
        <div className="flex-1 min-h-0 flex">
          <Betz />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
