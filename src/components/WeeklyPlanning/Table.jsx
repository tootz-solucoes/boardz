import getWeeklyHeaders from "./getWeeklyHeaders";

export default function WeeklyPlanningTable({ rows, loading, error }) {
  const headers = getWeeklyHeaders();

  return (
    <div className="tabela-wrapper">
      <table id="quadroTabela">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={{ minWidth: 80 }}>
                {header}
              </th>
            ))}
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
                {row.days.map((cell, colIdx) => (
                  <td key={colIdx}>
                    {loading ? (
                      <div className="table-cell-skeleton" />
                    ) : (
                      cell || <span style={{ color: "#bbb" }}>–</span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
