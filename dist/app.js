const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const compactEuro = (value) => value === null || value === undefined ? "n.a." : `${value < 0 ? "(" : ""}€${Math.abs(value / 1000).toLocaleString("en-IE", { maximumFractionDigits: 1 })}k${value < 0 ? ")" : ""}`;
const label = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()).replace(/Ppe/g, "PPE").replace(/Cogs/g, "COGS");
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const moneyRow = (key, value) => `<div class="money-row ${/(total|netProfit|grossProfit|operatingProfit|closingCash|closingEquity|netOperating|netInvesting|netFinancing|netCash|netPpe)/i.test(key) ? "total" : ""}"><span>${escapeHtml(label(key))}</span><strong>${compactEuro(value)}</strong></div>`;
const confidenceClass = (value) => value === "high" ? "good" : value === "medium" ? "watch" : "risk";

async function loadSubmission() {
  const response = await fetch("/submission.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Submission data failed to load (${response.status})`);
  return response.json();
}

function renderStatements(data) {
  const labels = { profitAndLoss: "Profit and loss", cashFlow: "Cash flow", balanceSheet: "Balance sheet" };
  const container = document.querySelector("#statement-grid");
  container.innerHTML = Object.entries(data.statements).map(([name, statement]) => {
    const rows = name === "balanceSheet"
      ? [
          ...Object.entries(statement.assets),
          ...Object.entries(statement.liabilities),
          ["closingEquity", statement.equity.closingEquity],
          ["totalLiabilitiesAndEquity", statement.totalLiabilitiesAndEquity]
        ]
      : Object.entries(statement);
    return `<article class="statement-card"><div class="statement-title"><h3>${labels[name]}</h3><span>EUR</span></div>${rows.map(([key, value]) => moneyRow(key, value)).join("")}</article>`;
  }).join("");
}

function flattenSchedule(schedule) {
  const rows = [];
  Object.entries(schedule).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      rows.push([label(key), null, true]);
      Object.entries(value).forEach(([subKey, subValue]) => rows.push([label(subKey), subValue, false]));
    } else rows.push([label(key), value, false]);
  });
  return rows;
}

function renderSchedules(data) {
  const container = document.querySelector("#schedule-grid");
  container.innerHTML = Object.entries(data.schedules).map(([name, schedule]) => `<article class="schedule-card"><h3>${escapeHtml(label(name))}</h3><div>${flattenSchedule(schedule).map(([rowLabel, value, heading]) => heading ? `<p class="schedule-subhead">${escapeHtml(rowLabel)}</p>` : `<div class="schedule-row"><span>${escapeHtml(rowLabel)}</span><strong>${typeof value === "number" ? compactEuro(value) : escapeHtml(value)}</strong></div>`).join("")}</div></article>`).join("");
}

function decisionMarkup(decision) {
  const material = decision.reviewTier === "material_judgment";
  const flags = [
    material ? `<span class="pill material">Material</span>` : `<span class="pill">Operational</span>`,
    `<span class="pill ${confidenceClass(decision.confidence)}">${escapeHtml(decision.confidence)} confidence</span>`,
    decision.agentDisagreement ? `<span class="pill risk">Agent disagreement</span>` : "",
    decision.changedFromAI ? `<span class="pill risk">Override</span>` : ""
  ].join("");
  const materialBlock = material ? `<div class="trail-compact"><div><span>Agent 1</span><p>${escapeHtml(decision.aiProposal)}</p></div><div><span>Independent challenge</span><p>${escapeHtml(decision.independentChallenge)}</p></div><div><span>Final reasoning</span><p>${escapeHtml(decision.studentReasoning)}</p></div></div>` : "";
  return `<details class="decision-item" data-tier="${decision.reviewTier}" data-confidence="${decision.confidence}" data-disagreement="${decision.agentDisagreement}"><summary><span class="decision-id">${decision.id}</span><span class="decision-question">${escapeHtml(decision.question)}</span><span class="decision-pills">${flags}</span></summary><div class="decision-body"><p class="answer">${escapeHtml(decision.answer)}</p>${materialBlock}<p class="evidence-line"><strong>Evidence:</strong> ${decision.evidence.map(escapeHtml).join(" · ")}</p></div></details>`;
}

function renderDecisions(data) {
  const list = document.querySelector("#decision-list");
  const count = document.querySelector("#decision-count");
  const search = document.querySelector("#decision-search");
  const tier = document.querySelector("#decision-tier");
  const draw = () => {
    const query = search.value.trim().toLowerCase();
    const selectedTier = tier.value;
    const items = data.decisions.filter((d) => (selectedTier === "all" || d.reviewTier === selectedTier) && (!query || `${d.id} ${d.question} ${d.answer}`.toLowerCase().includes(query)));
    count.textContent = `${items.length} of 100 decisions shown`;
    list.innerHTML = items.map(decisionMarkup).join("");
  };
  search.addEventListener("input", draw);
  tier.addEventListener("change", draw);
  draw();
}

function renderEvidence(data) {
  document.querySelector("#evidence-body").innerHTML = data.evidence.map((item) => `<tr><td><strong>${escapeHtml(item.file)}</strong><small>${escapeHtml(item.type)}</small></td><td><span class="pill ${confidenceClass(item.reliability)}">${escapeHtml(item.reliability)}</span></td><td>${escapeHtml(item.finding)}</td></tr>`).join("");
}

function renderReconciliations(data) {
  document.querySelector("#reconciliation-list").innerHTML = data.reconciliations.map((item) => `<article><span class="recon-icon ${item.status === "pass" ? "pass" : "watch"}">${item.status === "pass" ? "✓" : "!"}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.calculation)}</small></div><b>${item.difference === 0 ? "€0" : compactEuro(item.difference)}</b></article>`).join("");
}

function uncertaintyMarkup(item) {
  return `<article class="uncertainty-card"><div><span class="pill ${item.severity === "material" ? "risk" : "watch"}">${escapeHtml(item.severity)}</span><h3>${escapeHtml(item.issue)}</h3></div><p><strong>Selected:</strong> ${escapeHtml(item.selectedTreatment)}</p><p><strong>Alternative:</strong> ${escapeHtml(item.alternative)}</p><p class="recommendation">${escapeHtml(item.recommendation)}</p></article>`;
}

function renderUncertainties(data, selector = "#uncertainty-grid") {
  document.querySelector(selector).innerHTML = data.uncertainties.map(uncertaintyMarkup).join("");
}

function renderBoard(data) {
  document.querySelector("#board-decision").textContent = data.boardRecommendation.decision;
  document.querySelector("#board-rationale").textContent = `${data.boardRecommendation.valuationBasis} ${data.boardRecommendation.rationale}`;
  document.querySelector("#board-actions").innerHTML = data.boardRecommendation.immediateActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function effectMarkup(effect) {
  return Object.entries(effect).map(([key, value]) => `<div><span>${escapeHtml(label(key))}</span><strong>${value === null ? "n.a." : compactEuro(value)}</strong></div>`).join("");
}

function trailMarkup(decision) {
  return `<article class="trail-card" data-confidence="${decision.confidence}" data-disagreement="${decision.agentDisagreement}" data-override="${decision.changedFromAI}"><div class="trail-head"><span class="decision-id">${decision.id}</span><div><h2>${escapeHtml(decision.question)}</h2><div class="decision-pills"><span class="pill ${confidenceClass(decision.confidence)}">${escapeHtml(decision.confidence)}</span>${decision.agentDisagreement ? '<span class="pill risk">Agent disagreement</span>' : ""}${decision.changedFromAI ? '<span class="pill risk">Override</span>' : ""}</div></div></div><div class="position-grid"><div><span>Agent 1 proposal</span><p>${escapeHtml(decision.aiProposal)}</p></div><div><span>Independent challenge</span><p>${escapeHtml(decision.independentChallenge)}</p></div><div class="final-position"><span>Certified final answer</span><p>${escapeHtml(decision.answer)}</p></div></div><div class="reasoning-block"><span>Reasoning</span><p>${escapeHtml(decision.studentReasoning)}</p></div><div class="effect-grid">${effectMarkup(decision.statementEffect)}</div><p class="evidence-line"><strong>Evidence:</strong> ${decision.evidence.map(escapeHtml).join(" · ")}</p></article>`;
}

function renderReview(data) {
  const material = data.decisions.filter((d) => d.reviewTier === "material_judgment");
  document.querySelector("#review-disagreements").textContent = material.filter((d) => d.agentDisagreement).length;
  document.querySelector("#review-overrides").textContent = material.filter((d) => d.changedFromAI).length;
  document.querySelector("#review-low").textContent = data.decisions.filter((d) => d.confidence === "low").length;
  document.querySelector("#review-material").textContent = material.length;
  const list = document.querySelector("#trail-list");
  const count = document.querySelector("#review-count");
  const search = document.querySelector("#review-search");
  let active = "all";
  const draw = () => {
    const query = search.value.trim().toLowerCase();
    let items = active === "low" ? data.decisions.filter((d) => d.confidence === "low") : material;
    if (active === "disagreement") items = material.filter((d) => d.agentDisagreement);
    if (active === "override") items = material.filter((d) => d.changedFromAI);
    items = items.filter((d) => !query || `${d.id} ${d.question} ${d.answer}`.toLowerCase().includes(query));
    count.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
    list.innerHTML = items.length ? items.map(trailMarkup).join("") : '<div class="empty-state">No items match this filter.</div>';
  };
  document.querySelectorAll("[data-review-filter]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-review-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    active = button.dataset.reviewFilter;
    draw();
  }));
  search.addEventListener("input", draw);
  draw();
  renderUncertainties(data, "#review-uncertainty-grid");
}

function showLoadError(error) {
  const main = document.querySelector("main");
  main.insertAdjacentHTML("afterbegin", `<div class="load-error"><strong>Submission data could not be loaded.</strong><span>${escapeHtml(error.message)}</span></div>`);
}

loadSubmission().then((data) => {
  if (document.body.dataset.page === "review") renderReview(data);
  else {
    renderStatements(data);
    renderSchedules(data);
    renderDecisions(data);
    renderEvidence(data);
    renderReconciliations(data);
    renderUncertainties(data);
    renderBoard(data);
  }
}).catch(showLoadError);
