import { useMemo } from "react";
import { normalizeDate } from "../Calendar2026/utils";
import getWeeklyHeaders from "./getWeeklyHeaders";

export default function WeeklyPlanningTable({ rows, loading, error }) {
  const headers = getWeeklyHeaders();

  // Identificar qual coluna é o dia de hoje
  const todayColumnIndex = useMemo(() => {
    const today = normalizeDate(new Date());
    const dayOfWeek = today.getDay();

    // Se for sábado ou domingo, não destaca nenhuma coluna
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;

    // Verificar se hoje está na semana sendo exibida
    // getWeeklyHeaders sempre mostra a semana atual, então verificamos se hoje está nessa semana
    const referenceDate = new Date();
    const isSaturday = referenceDate.getDay() === 6;
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - ((referenceDate.getDay() + 6) % 7) + (isSaturday ? 7 : 0));
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const todayTime = today.getTime();
    const mondayTime = monday.getTime();
    const fridayTime = friday.getTime();

    // Só destaca se hoje está entre segunda e sexta da semana atual
    if (todayTime >= mondayTime && todayTime <= fridayTime && dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Segunda = 1, Terça = 2, Quarta = 3, Quinta = 4, Sexta = 5
      // Mas a tabela começa com "DEV" no índice 0, então segunda é índice 1
      return dayOfWeek; // Retorna o índice da coluna (1-5)
    }

    return null;
  }, []);

  return (
    <div className="tabela-wrapper">
      <table id="quadroTabela">
        <thead>
          <tr>
            {headers.map((header, idx) => {
              const isTodayColumn = idx === todayColumnIndex;
              return (
                <th
                  key={header}
                  style={{
                    minWidth: 80,
                    ...(isTodayColumn && {
                      background: "linear-gradient(135deg, rgba(124, 90, 207, 0.2) 0%, rgba(107, 70, 193, 0.2) 100%)",
                      border: "2px solid #7c5acf",
                      boxShadow: "0 0 8px rgba(124, 90, 207, 0.3)"
                    })
                  }}
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td colSpan={headers.length} style={{ color: "red" }}>
                {error}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.dev}>
                <td>{row.dev}</td>
                {row.days.map((cell, colIdx) => {
                  const isTodayCell = colIdx + 1 === todayColumnIndex;
                  return (
                    <td
                      key={colIdx}
                      style={isTodayCell ? {
                        background: "linear-gradient(135deg, rgba(124, 90, 207, 0.15) 0%, rgba(107, 70, 193, 0.15) 100%)",
                        borderLeft: "2px solid #7c5acf",
                        borderRight: "2px solid #7c5acf",
                        boxShadow: "inset 0 0 8px rgba(124, 90, 207, 0.2)"
                      } : {}}
                    >
                      {loading ? (
                        <div className="table-cell-skeleton" />
                      ) : (
                        cell || <span style={{ color: "#bbb" }}>–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
