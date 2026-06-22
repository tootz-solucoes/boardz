import { useState } from "react";
import SprintProgress from "../components/SprintProgress";
import Lembrettz from "../components/Lembrettz";
import Betz from "../components/Betz";
import BugTracker from "../components/BugTracker";

function HomePage() {
  const [sprintListId, setSprintListId] = useState(null);

  return (
    <div className="content p-[0.75em_1em] max-w-[1800px] w-full h-screen flex gap-[1.2rem] box-border mx-auto overflow-hidden">
      <div className="flex-2 min-h-0 flex">
        <SprintProgress onSprintListId={setSprintListId} />
      </div>
      <div className="flex-1 min-h-0 flex flex-col gap-[1.2rem]">
        <Lembrettz />
        <Betz />
        <div className="flex-1 min-h-0 flex">
          <BugTracker sprintListId={sprintListId} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
