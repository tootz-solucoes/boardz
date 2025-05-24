export default function mapSheetRows({ data, matchHeaders = true }) {
  return data.map((row) => {
    if (matchHeaders)
      return {
        dev: row["DEV"] || "",
        days: [
          row["SEGUNDA"] || "",
          row["TERÇA"] || "",
          row["QUARTA"] || "",
          row["QUINTA"] || "",
          row["SEXTA"] || "",
        ],
      };
    else
      return {
        dev: row[0] || "",
        days: [
          row[1] || "",
          row[2] || "",
          row[3] || "",
          row[4] || "",
          row[5] || "",
        ],
      };
  });
}
