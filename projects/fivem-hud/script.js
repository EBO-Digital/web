const container = document.getElementById("toasts");
if (!container) {
  console.error("Container #toasts introuvable");
}



// HUD values
const ranges = {
  hp: document.getElementById("hp"),
  armor: document.getElementById("armor"),
  hunger: document.getElementById("hunger"),
  thirst: document.getElementById("thirst"),
};

// -------------------------
// Mode In-Game (H)
// -------------------------
let inGame = false;

function setInGameMode(on) {
  inGame = !!on;
  document.body.classList.toggle("ingame", inGame);
  // Optionnel: mémoriser
  localStorage.setItem("ebo_ingame", inGame ? "1" : "0");
}

// restore
setInGameMode(localStorage.getItem("ebo_ingame") === "1");

// Toggle au clavier (H)
window.addEventListener("keydown", (e) => {
  // évite de toggler quand tu écris dans un input
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea") return;

  if (e.key.toLowerCase() === "h") {
    setInGameMode(!inGame);
  }
});


const ui = {
  hpFill: document.getElementById("hpFill"),
  armorFill: document.getElementById("armorFill"),
  hungerFill: document.getElementById("hungerFill"),
  thirstFill: document.getElementById("thirstFill"),

  hpVal: document.getElementById("hpVal"),
  armorVal: document.getElementById("armorVal"),
  hungerVal: document.getElementById("hungerVal"),
  thirstVal: document.getElementById("thirstVal"),
};


// -------------------------
// Cash animé
// -------------------------
const cashEl = document.getElementById("hudCash");
let cash = 3250; // valeur initiale (peut venir d'ailleurs)

function formatCash(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.round(n)));
}

function showCashPop(delta) {
  const pill = document.querySelector(".money-pill");
  if (!pill) return;

  const pop = document.createElement("span");
  pop.className = `cash-pop ${delta >= 0 ? "plus" : "minus"} show`;
  pop.textContent = `${delta >= 0 ? "+" : "-"}${formatCash(Math.abs(delta))}$`;
  pill.appendChild(pop);

  setTimeout(() => pop.remove(), 700);
}

function animateCash(from, to, duration = 450) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const val = from + (to - from) * eased;
    cashEl.textContent = formatCash(val);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setCash(newCash, deltaForPop = null) {
  const prev = cash;
  cash = Math.max(0, Math.round(newCash));
  animateCash(prev, cash);
  if (typeof deltaForPop === "number" && deltaForPop !== 0) {
    showCashPop(deltaForPop);
  }
}

// init affichage
if (cashEl) cashEl.textContent = formatCash(cash);




function setBar(name, val) {
  const fill = ui[`${name}Fill`];
  const label = ui[`${name}Val`];

  if (!fill) return;

  fill.style.height = `${val}%`;

  if (label) {
    label.textContent = `${val}%`;
  }
}


const LOW_THRESHOLDS = {
  hp: 30,
  hunger: 25,
  thirst: 25,
};

function updateLowState(name, val) {
  const el = document.querySelector(`.vstat.${name}`);
  if (!el) return;
  const t = LOW_THRESHOLDS[name];
  if (typeof t !== "number") return;
  el.classList.toggle("low", val > 0 && val <= t);
}


function refreshBars() {
  const hp = Number(ranges.hp.value);
  const armor = Number(ranges.armor.value);
  const hunger = Number(ranges.hunger.value);
  const thirst = Number(ranges.thirst.value);

  setBar("hp", hp);
  setBar("armor", armor);
  setBar("hunger", hunger);
  setBar("thirst", thirst);

  updateLowState("hp", hp);
  updateLowState("hunger", hunger);
  updateLowState("thirst", thirst);
}


Object.values(ranges).forEach((el) => el.addEventListener("input", refreshBars));
refreshBars();

// Toasts
const toasts = document.getElementById("toasts");

function addToast(type, title, message) {

  const sound = document.getElementById("notifSound");
  if (sound) {
    sound.currentTime = 0;
    sound.volume = 0.25;
    sound.play().catch(() => {});
  }

  const duration = 3200;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.setProperty("--duration", duration + "ms");

  toast.innerHTML = `
    <div class="dot"></div>
    <div>
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  const container = document.getElementById("toasts");
  container.appendChild(toast);

  // auto remove
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


// Buttons
document.getElementById("btnInfo").addEventListener("click", () => {
  addToast("info", "Information", "Tu viens de déclencher une notification d'information.");
});

document.getElementById("btnSuccess").addEventListener("click", () => {
  addToast("success", "Succès", "Action terminée avec succès.");
});

document.getElementById("btnWarn").addEventListener("click", () => {
  addToast("warn", "Attention", "Attention, un événement vient d’être déclenché.");
});

document.getElementById("btnError").addEventListener("click", () => {
  addToast("error", "Erreur", "Une erreur est survenue.");
});

document.getElementById("btnRandom").addEventListener("click", () => {
  ranges.hp.value = Math.floor(Math.random() * 101);
  ranges.armor.value = Math.floor(Math.random() * 101);
  ranges.hunger.value = Math.floor(Math.random() * 101);
  ranges.thirst.value = Math.floor(Math.random() * 101);
  refreshBars();
  addToast("info", "Valeurs", "Stats random appliquées.");
});

document.getElementById("btnClear").addEventListener("click", () => {
  toasts.innerHTML = "";
});


document.getElementById("cashMinus")?.addEventListener("click", () => {
  setCash(cash - 100, -100);
});

document.getElementById("cashPlus")?.addEventListener("click", () => {
  setCash(cash + 100, +100);
});

document.getElementById("cashPlusBig")?.addEventListener("click", () => {
  setCash(cash + 1000, +1000);
});


const panel = document.querySelector(".panel");
const btnToggleUI = document.getElementById("btnToggleUI");

function toggleUI() {
  panel.classList.toggle("hidden");
}

// bouton
btnToggleUI.addEventListener("click", toggleUI);

// touche H
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "h") {
    toggleUI();
  }
});

function toggleUI() {
  document.body.classList.toggle("ingame");
  const on = document.body.classList.contains("ingame");
  flashInGameBadge(on ? "MODE IN-GAME" : "MODE UI");
}

function flashInGameBadge(text = "MODE IN-GAME") {
  const badge = document.getElementById("ingameBadge");
  if (!badge) return;

  badge.textContent = text;

  // relance l'animation même si elle vient de jouer
  badge.classList.remove("show");
  void badge.offsetWidth; // force reflow
  badge.classList.add("show");
}


