import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import CalendarGeralPage from "./pages/CalendarGeralPage";
import DebugOverlay from "./components/DebugOverlay";

const isDebug = new URLSearchParams(window.location.search).has("debug");

function App() {
  return (
    <>
      {isDebug && <DebugOverlay />}
      {/* <nav style={{ padding: "1rem", textAlign: "center" }}>
        <Link
          to="/"
          style={{
            margin: "0 1rem",
            color: "#b388ff",
            textDecoration: "none",
          }}
        >
          Home
        </Link>
        <Link
          to="/calendario"
          style={{
            margin: "0 1rem",
            color: "#b388ff",
            textDecoration: "none",
          }}
        >
          Calendário 2026
        </Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/calendario-geral" element={<Navigate to="/calendario-colaboradores" replace />} />
        <Route path="/calendario-colaboradores" element={<CalendarGeralPage />} />
      </Routes>
    </>
  );
}

export default App;
