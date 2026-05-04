const DATE_LABELS = {
  date_2026_05_20: "Mercredi 20 mai 2026",
  date_2026_05_27: "Mercredi 27 mai 2026",
  date_2026_06_10: "Mercredi 10 juin 2026",
  date_2026_06_11: "Jeudi 11 juin 2026",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function aggregate(rows) {
  if (!rows.length) return null;
  const headers = rows[0];
  const dataRows = rows.slice(1);
  const result = {};

  for (const key of Object.keys(DATE_LABELS)) {
    result[key] = { Disponible: 0, Possible: 0, Indisponible: 0 };
  }

  for (const dataRow of dataRows) {
    for (const key of Object.keys(DATE_LABELS)) {
      const index = headers.indexOf(key);
      if (index === -1) continue;
      const value = (dataRow[index] || "").trim();
      if (result[key][value] !== undefined) result[key][value] += 1;
    }
  }

  return { headers, result, submissionCount: dataRows.length };
}

function renderAggregate(summary) {
  const target = document.querySelector("[data-admin-results]");
  const count = document.querySelector("[data-submission-count]");
  if (!target || !summary) return;

  count.textContent = String(summary.submissionCount);
  target.innerHTML = "";

  const table = document.createElement("table");
  table.className = "poll-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Disponible</th>
        <th>Possible</th>
        <th>Indisponible</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  for (const key of Object.keys(DATE_LABELS)) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${DATE_LABELS[key]}</strong></td>
      <td>${summary.result[key].Disponible}</td>
      <td>${summary.result[key].Possible}</td>
      <td>${summary.result[key].Indisponible}</td>
    `;
    tbody.appendChild(row);
  }

  target.appendChild(table);
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-admin-form]");
  const message = document.querySelector("[data-admin-message]");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = form.querySelector("textarea")?.value || "";
    const rows = parseCsv(text);
    const summary = aggregate(rows);

    if (!summary) {
      message.textContent = "Aucune donnee lisible detectee. Collez un export CSV Netlify complet.";
      return;
    }

    message.textContent = "Aggregation terminee.";
    renderAggregate(summary);
  });
});
