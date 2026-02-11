const input = document.getElementById("taskInput");
const button = document.getElementById("addTaskBtn");
const list = document.getElementById("taskList");

const STORAGE_KEY = "todo_tasks_v1";
const counterEl = document.getElementById("counter");

let currentFilter = "all";

const clearDoneBtn = document.getElementById("clearDoneBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

clearDoneBtn.addEventListener("click", clearDoneTasks);
clearAllBtn.addEventListener("click", clearAllTasks);


button.addEventListener("click", addTask);


input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();

  }
});

// ✅ Charger au démarrage
loadTasks();
updateCounter();
updateClearDoneButton();


/* --------------------------
   CRUD tâches
-------------------------- */

function addTask() {
  const taskText = input.value.trim();
  if (taskText === "") {
    console.log("Champ vide !");
    return;
  }

  const li = createTaskElement({ text: taskText, done: false });
  list.appendChild(li);

  input.value = "";
  saveTasks();
  updateCounter();
  animateTask(li);

}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.draggable = true;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;

  // Label
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = task.text;

  // Appliquer l'état "done"
  li.classList.toggle("done", task.done);

  // ✅ Cocher = toggle + save
  checkbox.addEventListener("change", () => {
    li.classList.toggle("done", checkbox.checked);
    saveTasks();
    updateCounter();

  });

  // ✅ Double-clic = supprimer + save
  li.addEventListener("dblclick", () => {
    li.remove();
    saveTasks();
    updateCounter();

  });

  // Drag & drop
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragend", handleDragEnd);

  li.appendChild(checkbox);
  li.appendChild(label);

  return li;
}

function updateClearDoneButton() {
  const doneCount = list.querySelectorAll(
    ".task input[type='checkbox']:checked"
  ).length;

  clearDoneBtn.disabled = doneCount === 0;
}
/* --------------------------
   LocalStorage
-------------------------- */

function saveTasks() {
  const tasks = [...list.querySelectorAll(".task")].map((li) => {
    const text = li.querySelector(".label").textContent;
    const done = li.querySelector('input[type="checkbox"]').checked;
    return { text, done };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  console.log("Sauvegardé :", tasks);
  updateCounter();
  applyFilter();
  updateDragState();
  updateClearDoneButton();

}

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const tasks = JSON.parse(raw);
    for (const task of tasks) {
      const li = createTaskElement(task);
      list.appendChild(li);
    }
    console.log("Chargé :", tasks);
    updateDragState();

  } catch (err) {
    console.log("Erreur de chargement localStorage :", err);
  }
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    setActiveFilterButton(currentFilter);
    applyFilter();
    updateDragState();
  });
});


/* --------------------------
   Drag & Drop (réordonner)
-------------------------- */

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "drag");
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedItem = null;
  // ✅ sauvegarder après déplacement
  saveTasks();
  updateCounter();

}

list.addEventListener("dragover", (e) => {
    if (currentFilter !== "all") return;
  e.preventDefault();

  if (!draggedItem) return;

  const afterElement = getDragAfterElement(list, e.clientY);

  if (afterElement == null) {
    list.appendChild(draggedItem);
  } else {
    list.insertBefore(draggedItem, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  for (const child of draggableElements) {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);

    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  }

  return closest.element;
}

// COMPTER LES TACHES 

function updateCounter() {
  const tasks = list.querySelectorAll(".task");
  const doneTasks = list.querySelectorAll(".task input[type='checkbox']:checked");

  const total = tasks.length;
  const done = doneTasks.length;

  const taskWord = total <= 1 ? "tâche" : "tâches";
  const doneWord = done <= 1 ? "terminée" : "terminées";

  counterEl.textContent = `${total} ${taskWord} · ${done} ${doneWord}`;
}

// Filtrer les tâches (bonus)

function applyFilter() {
  const tasks = list.querySelectorAll(".task");

  tasks.forEach((li) => {
    const isDone = li.querySelector('input[type="checkbox"]').checked;

    if (currentFilter === "all") {
      li.style.display = "";
    } else if (currentFilter === "active") {
      li.style.display = isDone ? "none" : "";
    } else if (currentFilter === "done") {
      li.style.display = isDone ? "" : "none";
    }
  });
}

function setActiveFilterButton(filter) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

function updateDragState() {
  const enableDrag = currentFilter === "all";

  list.querySelectorAll(".task").forEach((li) => {
    li.draggable = enableDrag;
    li.classList.toggle("no-drag", !enableDrag);
  });
}

function clearDoneTasks() {
  const doneTasks = list.querySelectorAll(".task input[type='checkbox']:checked");
  doneTasks.forEach((cb) => cb.closest(".task").remove());

  saveTasks(); // met à jour localStorage + compteur + filtre + drag state
}

function clearAllTasks() {
  const total = list.querySelectorAll(".task").length;

  if (total === 0) return;

  const ok = confirm("Tu es sûr(e) de vouloir tout effacer ? Cette action est irréversible.");
  if (!ok) return;

  list.innerHTML = "";
  saveTasks();
}

function animateTask(li) {
  li.classList.add("task-appear");
  requestAnimationFrame(() => {
    li.classList.add("task-appear--in");
  });
  setTimeout(() => {
    li.classList.remove("task-appear", "task-appear--in");
  }, 260);
}


const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

