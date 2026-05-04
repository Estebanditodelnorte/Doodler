const ACCESS_CODE = "mai-ia-2026";
const CONFIG = window.POLL_CONFIG || null;
const HAS_LIVE_BACKEND = Boolean(CONFIG?.supabaseUrl && CONFIG?.supabaseAnonKey && CONFIG?.tableName);

const POLL_DATES = [
  { id: "date_2026_05_20", label: "Mercredi 20 mai 2026", window: "9 h 00 a 10 h 30" },
  { id: "date_2026_05_27", label: "Mercredi 27 mai 2026", window: "13 h 30 a 15 h 00" },
  { id: "date_2026_06_10", label: "Mercredi 10 juin 2026", window: "9 h 00 a 10 h 30" },
  { id: "date_2026_06_11", label: "Jeudi 11 juin 2026", window: "13 h 30 a 15 h 00" },
];

let supabaseClient = null;

async function getSupabaseClient() {
  if (!HAS_LIVE_BACKEND) return null;
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabaseClient = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  return supabaseClient;
}

function createDateRows() {
  const target = document.querySelector("[data-date-rows]");
  if (!target) return;

  target.innerHTML = "";

  for (const date of POLL_DATES) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <strong>${date.label}</strong>
        <div class="small">${date.window}</div>
      </td>
      <td>
        <label class="hidden" for="${date.id}">Disponibilite pour ${date.label}</label>
        <select name="${date.id}" id="${date.id}" required>
          <option value="">Choisir</option>
          <option value="Disponible">Disponible</option>
          <option value="Possible">Possible</option>
          <option value="Indisponible">Indisponible</option>
        </select>
      </td>
    `;
    target.appendChild(tr);
  }
}

function updateSummary() {
  const values = POLL_DATES.map((date) => document.getElementById(date.id)?.value || "");
  const counts = {
    Disponible: values.filter((v) => v === "Disponible").length,
    Possible: values.filter((v) => v === "Possible").length,
    Indisponible: values.filter((v) => v === "Indisponible").length,
  };

  const available = document.querySelector("[data-count-available]");
  const maybe = document.querySelector("[data-count-maybe]");
  const no = document.querySelector("[data-count-no]");

  if (available) available.textContent = counts.Disponible;
  if (maybe) maybe.textContent = counts.Possible;
  if (no) no.textContent = counts.Indisponible;
}

function getFormPayload(form) {
  const payload = {
    name: form.querySelector("#name")?.value?.trim() || "",
    organization: form.querySelector("#organization")?.value?.trim() || "",
    role: form.querySelector("#role")?.value?.trim() || "",
    email: form.querySelector("#email")?.value?.trim() || "",
    shared_by: form.querySelector("#shared_by")?.value?.trim() || "",
    comments: form.querySelector("#comments")?.value?.trim() || "",
  };

  for (const date of POLL_DATES) {
    payload[date.id] = form.querySelector(`#${date.id}`)?.value || "";
  }

  return payload;
}

function validatePayload(payload) {
  if (!payload.name || !payload.organization || !payload.role) {
    return "Veuillez remplir le nom, l'organisation et le role.";
  }
  for (const date of POLL_DATES) {
    if (!payload[date.id]) return "Merci de choisir une reponse pour chaque date.";
  }
  return "";
}

function renderLiveResults(rows) {
  const target = document.querySelector("[data-live-results]");
  const participantsWrap = document.querySelector("[data-live-participants-wrap]");
  const participantsTarget = document.querySelector("[data-live-participants]");
  const status = document.querySelector("[data-live-status]");
  if (!target || !status) return;

  const totals = {};
  for (const date of POLL_DATES) {
    totals[date.id] = { Disponible: 0, Possible: 0, Indisponible: 0 };
  }

  for (const row of rows) {
    for (const date of POLL_DATES) {
      const value = row[date.id];
      if (totals[date.id][value] !== undefined) totals[date.id][value] += 1;
    }
  }

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
  for (const date of POLL_DATES) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${date.label}</strong><div class="small">${date.window}</div></td>
      <td>${totals[date.id].Disponible}</td>
      <td>${totals[date.id].Possible}</td>
      <td>${totals[date.id].Indisponible}</td>
    `;
    tbody.appendChild(tr);
  }

  target.innerHTML = "";
  target.appendChild(table);
  status.textContent = `${rows.length} reponse(s) recue(s). Vue mise a jour automatiquement.`;

  if (CONFIG?.showParticipantNames && participantsWrap && participantsTarget) {
    participantsWrap.classList.remove("hidden");
    const items = rows
      .map((row) => {
        const label = [row.name, row.organization].filter(Boolean).join(" - ");
        return `<div class="chip">${label}</div>`;
      })
      .join(" ");
    participantsTarget.innerHTML = items || "<span>Aucune reponse pour l'instant.</span>";
  }
}

async function refreshLiveResults() {
  const status = document.querySelector("[data-live-status]");
  if (!HAS_LIVE_BACKEND) {
    if (status) {
      status.textContent = "Pour afficher les reponses du groupe, configurez Supabase dans config.js.";
    }
    return;
  }

  const client = await getSupabaseClient();
  const { data, error } = await client
    .from(CONFIG.tableName)
    .select("name, organization, role, date_2026_05_20, date_2026_05_27, date_2026_06_10, date_2026_06_11, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    if (status) status.textContent = "Impossible de charger les reponses en direct pour le moment.";
    return;
  }

  renderLiveResults(data || []);
}

async function submitLivePayload(payload) {
  const client = await getSupabaseClient();
  const { error } = await client.from(CONFIG.tableName).insert(payload);
  if (error) throw error;
}

function showFormMessage(text, isError = false) {
  const box = document.querySelector("[data-form-message]");
  if (!box) return;
  box.textContent = text;
  box.classList.remove("hidden");
  box.classList.toggle("warning", isError);
  box.classList.toggle("notice", !isError);
}

function unlockPoll() {
  sessionStorage.setItem("pollAccessGranted", "yes");
  document.querySelector("[data-gate]")?.classList.add("hidden");
  document.querySelector("[data-poll]")?.classList.remove("hidden");
  refreshLiveResults();
}

function initGate() {
  if (sessionStorage.getItem("pollAccessGranted") === "yes") {
    unlockPoll();
    return;
  }

  const form = document.querySelector("[data-gate-form]");
  const message = document.querySelector("[data-gate-message]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = form.querySelector("input[name='access_code']")?.value?.trim();
    if (code === ACCESS_CODE) {
      unlockPoll();
      return;
    }
    if (message) {
      message.textContent = "Code incorrect. Verifiez le courriel d'invitation.";
      message.classList.remove("hidden");
    }
  });
}

function initSummaryTracking() {
  for (const date of POLL_DATES) {
    document.getElementById(date.id)?.addEventListener("change", updateSummary);
  }
  updateSummary();
}

function initSubmission() {
  const form = document.querySelector("form[name='ia-loi25-dates']");
  const submitButton = document.querySelector("[data-submit-button]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    if (!HAS_LIVE_BACKEND) return;
    event.preventDefault();

    const payload = getFormPayload(form);
    const validationError = validatePayload(payload);
    if (validationError) {
      showFormMessage(validationError, true);
      return;
    }

    submitButton?.setAttribute("disabled", "disabled");
    showFormMessage("Envoi en cours...");

    try {
      await submitLivePayload(payload);
      form.reset();
      updateSummary();
      showFormMessage("Merci. Votre reponse a ete enregistree.");
      await refreshLiveResults();
    } catch (error) {
      console.error(error);
      showFormMessage("Impossible d'enregistrer la reponse pour le moment.", true);
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}

async function initLiveSubscription() {
  if (!HAS_LIVE_BACKEND) return;
  const client = await getSupabaseClient();
  client
    .channel("poll-live-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: CONFIG.tableName }, () => {
      refreshLiveResults();
    })
    .subscribe();
}

window.addEventListener("DOMContentLoaded", () => {
  createDateRows();
  initGate();
  initSummaryTracking();
  initSubmission();
  initLiveSubscription();
});
