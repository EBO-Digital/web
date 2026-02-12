// --- Pricing (éditable facilement) ---
const PRICING = {
  fivem: {
    services: [
                    { id: "config_simple", title: "Configuration/adaptation d'un script simple", desc: "Ajustements de config + adaptation légère.", price: 5 },
{ id: "config_complexe", title: "Configuration/adaptation d'un script complexe", desc: "Adaptation plus longue (events, compat, équilibrage).", price: 15 },
      { id: "script_simple", title: "Création d'un script simple", desc: "Petite feature / ajustement / event basique.", price: 20 },
      { id: "ui_nui", title: "UI NUI", desc: "UI simple, écran menu, HUD, etc.", price: 10 },
      { id: "script_complexe", title: "Création d'un script complexe", desc: "Système complet, logique + config + events.", price: 50 },
    ],
    options: [
      { id: "install", title: "Installation", desc: "Aide à l’installation / intégration.", price: 5 },
      { id: "support7", title: "Support 7 jours", desc: "Corrections + ajustements légers.", price: 5 },
      { id: "fast48", title: "Livraison 48h", desc: "Priorité (selon planning).", price: 10 },
      { id: "ui_custom", title: "UI personnalisée", desc: "Design/animations plus poussés.", price: 15 },

    ],
  },
  web: {
    services: [
      { id: "landing", title: "Landing page", desc: "1 page propre + CTA + responsive.", price: 80 },
      { id: "vitrine", title: "Site vitrine", desc: "2–4 pages, sections, contact.", price: 120 },
      { id: "webapp_simple", title: "Web app simple", desc: "Petite app JS (CRUD simple, etc.).", price: 200 },
      { id: "refonte_ui", title: "Refonte UI", desc: "Modernisation d’une page existante.", price: 70 },
    ],
    options: [
      { id: "seo", title: "SEO basique", desc: "Balises + structure + perf simple.", price: 30 },
      { id: "responsive_plus", title: "Responsive avancé", desc: "Détails mobile/tablet + polish.", price: 40 },
      { id: "maintenance", title: "Maintenance 1 mois", desc: "Petites modifications / correctifs.", price: 25 },
      { id: "anim_custom", title: "Animations custom", desc: "Transitions / micro-interactions.", price: 30 },
    ],
  },
};

let mode = "fivem"; // fivem | web

// Elements
const servicesWrap = document.getElementById("services");
const optionsWrap = document.getElementById("options");

const tabFiveM = document.getElementById("tabFiveM");
const tabWeb = document.getElementById("tabWeb");

const totalPriceEl = document.getElementById("totalPrice");
const quoteOutput = document.getElementById("quoteOutput");
const copiedMsg = document.getElementById("copiedMsg");

const projectName = document.getElementById("projectName");
const eta = document.getElementById("eta");
const payment = document.getElementById("payment");
const contact = document.getElementById("contact");

const btnGenerate = document.getElementById("btnGenerate");
const btnCopy = document.getElementById("btnCopy");
const btnReset = document.getElementById("btnReset");

const notes = document.getElementById("notes");


function money(n) {
  return `${Math.max(0, Math.round(n))}€`;
}

function setMode(next) {
  mode = next;
  tabFiveM.classList.toggle("active", mode === "fivem");
  tabWeb.classList.toggle("active", mode === "web");
  tabFiveM.setAttribute("aria-selected", mode === "fivem");
  tabWeb.setAttribute("aria-selected", mode === "web");

  renderLists();
  updateTotal();
  quoteOutput.value = "";
  copiedMsg.textContent = "";
}

function renderItem(item, groupName) {
  const id = `${groupName}_${item.id}`;
  const el = document.createElement("label");
  el.className = "item";
  el.innerHTML = `
    <div class="left">
      <input type="checkbox" id="${id}" data-price="${item.price}" data-title="${item.title}" data-group="${groupName}">
      <div>
        <div class="title">${item.title}</div>
        <div class="desc">${item.desc}</div>
      </div>
    </div>
    <div class="priceTag">${money(item.price)}</div>
  `;
  el.querySelector("input").addEventListener("change", () => {
    updateTotal();
    copiedMsg.textContent = "";
  });
  return el;
}

function renderLists() {
  servicesWrap.innerHTML = "";
  optionsWrap.innerHTML = "";

  const pack = PRICING[mode];

  pack.services.forEach(s => servicesWrap.appendChild(renderItem(s, "service")));
  pack.options.forEach(o => optionsWrap.appendChild(renderItem(o, "option")));
}

function getChecked() {
  const inputs = document.querySelectorAll('input[type="checkbox"]:checked');
  const items = [];
  inputs.forEach(i => {
    items.push({
      title: i.dataset.title,
      price: Number(i.dataset.price || 0),
      group: i.dataset.group,
    });
  });
  return items;
}

function updateTotal() {
  const items = getChecked();
  const total = items.reduce((sum, it) => sum + it.price, 0);
  totalPriceEl.textContent = Math.round(total);
}

function buildQuote() {
  const items = getChecked();
  const total = items.reduce((sum, it) => sum + it.price, 0);

  const services = items.filter(i => i.group === "service");
  const options = items.filter(i => i.group === "option");

  const lines = [];

  lines.push("🧾 Devis — EBO Digital");
  lines.push("");
  lines.push(`Client : ${mode === "fivem" ? "🎮 FiveM" : "🌐 Web"}`);

  const name = (projectName.value || "").trim();
  if (name) lines.push(`Projet : ${name}`);

  lines.push("");
  lines.push("✅ Prestations :");
  if (services.length === 0) lines.push("- (aucune sélection)");
  services.forEach(s => lines.push(`- ${s.title} — ${money(s.price)}`));

  lines.push("");
  lines.push("🧩 Options :");
  if (options.length === 0) lines.push("- (aucune)");
  options.forEach(o => lines.push(`- ${o.title} — ${money(o.price)}`));

  lines.push("");
  lines.push(`💰 Total : ${money(total)}`);
  lines.push(`⏱️ Délai estimé : ${(eta.value || "à définir").trim()}`);
  lines.push(`💳 Paiement : ${payment.value}`);

  const c = (contact.value || "").trim();
  if (c) {
    lines.push("");
    lines.push(`📩 Contact : ${c}`);
  }

  const n = (notes?.value || "").trim();
if (n) {
  lines.push("");
  lines.push("📝 Notes :");
  lines.push(n);
}

  lines.push("");
  lines.push("Merci !");

  return lines.join("\n");
}

// Events
tabFiveM.addEventListener("click", () => setMode("fivem"));
tabWeb.addEventListener("click", () => setMode("web"));

btnGenerate.addEventListener("click", () => {
  quoteOutput.value = buildQuote();
  copiedMsg.textContent = "";
});

btnCopy.addEventListener("click", async () => {
  if (!quoteOutput.value.trim()) {
    quoteOutput.value = buildQuote();
  }
  try {
    await navigator.clipboard.writeText(quoteOutput.value);
    copiedMsg.textContent = "Copié ✅";
    setTimeout(() => (copiedMsg.textContent = ""), 1500);
  } catch {
    copiedMsg.textContent = "Impossible de copier (permissions navigateur).";
  }
});

btnReset.addEventListener("click", () => {
  document.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
  quoteOutput.value = "";
  copiedMsg.textContent = "";
  updateTotal();
});

// Init
renderLists();
updateTotal();
