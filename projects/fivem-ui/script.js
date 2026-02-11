// HUD values
const ranges = {
  hp: document.getElementById("hp"),
  armor: document.getElementById("armor"),
  hunger: document.getElementById("hunger"),
  thirst: document.getElementById("thirst"),
};

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

function setBar(name, val) {
  ui[`${name}Fill`].style.width = `${val}%`;
  ui[`${name}Val`].textContent = `${val}%`;
}

function refreshBars() {
  setBar("hp", Number(ranges.hp.value));
  setBar("armor", Number(ranges.armor.value));
  setBar("hunger", Number(ranges.hunger.value));
  setBar("thirst", Number(ranges.thirst.value));
}

Object.values(ranges).forEach((el) => el.addEventListener("input", refreshBars));
refreshBars();

// Toasts
const toasts = document.getElementById("toasts");

function addToast(type, title, message) {
  const el = document.createElement("div");
  el.className = `toast ${type}`;

  el.innerHTML = `
    <div class="dot" aria-hidden="true"></div>
    <div>
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  toasts.appendChild(el);

  // auto remove
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    el.style.transition = "opacity 180ms ease, transform 180ms ease";
    setTimeout(() => el.remove(), 220);
  }, 3200);
}

// Buttons
document.getElementById("btnInfo").addEventListener("click", () => {
  addToast("info", "Information", "Un événement vient d’être déclenché.");
});

document.getElementById("btnSuccess").addEventListener("click", () => {
  addToast("success", "Succès", "Action terminée avec succès.");
});

document.getElementById("btnWarn").addEventListener("click", () => {
  addToast("warn", "Attention", "Niveau faible détecté, surveille tes stats.");
});

document.getElementById("btnError").addEventListener("click", () => {
  addToast("error", "Erreur", "Une erreur est survenue. Vérifie la config.");
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
