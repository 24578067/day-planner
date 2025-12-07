const inputTitle = document.getElementById("task-name");
const addTaskBtn = document.getElementById("add-task-btn");
const generateTimeTableBtn = document.getElementById("generate-btn");
const durationButtonsBlock = document.getElementById("duration-buttons");
const slotButtonsBlock = document.getElementById("slot-buttons");
const clearAllBtn = document.getElementById("clear-all-btn");

const TASKS_STORAGE_KEY = "daily-planner-tasks";

let tasksArr = [];
loadTasksFromLocalStorage();
let durationBtnValue = null;
let selectedTimeSlot = "morning";

function formatDuration(minutes) {
  if (minutes === 30) return "30 минут";
  if (minutes === 60) return "1 час";
  if (minutes === 90) return "1.5 часа";
  if (minutes === 120) return "2 часа";
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
}

function saveTasksToLocalStorage() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksArr));
}

function loadTasksFromLocalStorage() {
  const saved = localStorage.getItem(TASKS_STORAGE_KEY);

  if (saved) {
    try {
      tasksArr = JSON.parse(saved);
    } catch (e) {
      console.warn("Не удалось загрузить задачи из localStorage", e);
      tasksArr = [];
    }
  }
}

function renderTasks() {
  const taskList = document.getElementById("tasks-list");
  taskList.innerHTML = "";

  if (tasksArr.length === 0) {
    let taskText = document.createElement("p");
    taskText.className = "empty-message";
    taskText.textContent = "Пока нет задач. Добавь первую!";
    taskList.appendChild(taskText);
  } else {
    for (const task of tasksArr) {
      const taskItem = document.createElement("div");
      const taskItemTitle = document.createElement("p");
      const taskItemTime = document.createElement("p");
      const taskItemBtn = document.createElement("button");

      taskItem.className = "task-item";
      taskItemTitle.className = "task-info";
      taskItemTime.className = "task-minutes";
      taskItemBtn.className = "btn btn-delete";

      taskItemTitle.textContent = task.name;
      const slotLabels = {
        morning: "Утро",
        afternoon: "День",
        evening: "Вечер",
      };
      taskItemTime.textContent = `${formatDuration(task.minutes)} · ${
        slotLabels[task.timeSlot]
      }`;
      taskItemBtn.textContent = "Удалить";

      taskItem.appendChild(taskItemTitle);
      taskItem.appendChild(taskItemTime);
      taskItem.appendChild(taskItemBtn);
      taskList.appendChild(taskItem);

      taskItemBtn.addEventListener("click", () => {
        tasksArr = tasksArr.filter((t) => t.id !== task.id);
        saveTasksToLocalStorage();

        renderTasks();
        updateGenerateBtn();
      });
    }
  }
}

function updateGenerateBtn() {
  if (tasksArr.length === 0) {
    generateTimeTableBtn.disabled = true;
  } else {
    generateTimeTableBtn.disabled = false;
  }
}

function generateSchedule() {
  const scheduledTasks = [];
  let currentTime = 8 * 60;

  scheduledTasks.push({
    start: "08:00",
    name: "Подъем",
    isFixed: true,
    isSleep: true,
  });

  scheduledTasks.push({
    start: minutesToTime(currentTime),
    end: minutesToTime(currentTime + 30),
    name: "Завтрак",
    isFixed: true,
    isSleep: false,
  });
  currentTime += 30;

  const morningTasks = tasksArr.filter((task) => task.timeSlot === "morning");
  const afternoonTasks = tasksArr.filter(
    (task) => task.timeSlot === "afternoon"
  );
  const eveningTasks = tasksArr.filter((task) => task.timeSlot === "evening");

  for (const task of morningTasks) {
    if (currentTime + task.minutes <= 13 * 60) {
      scheduledTasks.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + task.minutes),
        name: task.name,
        isFixed: false,
        isSleep: false,
      });
      currentTime += task.minutes;
    }
  }

  currentTime = 13 * 60;
  scheduledTasks.push({
    start: minutesToTime(currentTime),
    end: minutesToTime(currentTime + 60),
    name: "Обед",
    isFixed: true,
    isSleep: false,
  });
  currentTime += 60;

  for (const task of afternoonTasks) {
    if (currentTime + task.minutes <= 19 * 60) {
      scheduledTasks.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + task.minutes),
        name: task.name,
        isFixed: false,
        isSleep: false,
      });
      currentTime += task.minutes;
    }
  }

  currentTime = 19 * 60;
  scheduledTasks.push({
    start: minutesToTime(currentTime),
    end: minutesToTime(currentTime + 60),
    name: "Ужин",
    isFixed: true,
    isSleep: false,
  });
  currentTime += 60;

  for (const task of eveningTasks) {
    if (currentTime + task.minutes <= 24 * 60) {
      scheduledTasks.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + task.minutes),
        name: task.name,
        isFixed: false,
        isSleep: false,
      });
      currentTime += task.minutes;
    }
  }

  scheduledTasks.push({
    start: "00:00",
    end: "08:00",
    name: "Сон",
    isFixed: true,
    isSleep: true,
  });

  return scheduledTasks;
}

function renderSchedule(scheduledTasks) {
  const scheduleContainer = document.getElementById("schedule");
  scheduleContainer.innerHTML = "";

  if (scheduledTasks.length === 0) {
    let scheduleText = document.createElement("p");
    scheduleText.className = "empty-message";
    scheduleText.textContent =
      "Нажми 'Создать расписание', чтобы увидеть план дня";
    scheduleContainer.appendChild(scheduleText);
    return;
  }

  for (const item of scheduledTasks) {
    const itemContainer = document.createElement("div");
    itemContainer.className = "schedule-item";

    if (item.isFixed) {
      itemContainer.classList.add("schedule-item--fixed");
    }

    if (item.isSleep) {
      itemContainer.textContent = `${item.start} — ${item.name}`;
    } else {
      itemContainer.textContent = `${item.start}–${item.end} — ${item.name}`;
    }

    scheduleContainer.appendChild(itemContainer);
  }
}

slotButtonsBlock.addEventListener("click", (event) => {
  if (event.target.classList.contains("slot-btn")) {
    document.querySelectorAll(".slot-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");
    selectedTimeSlot = event.target.dataset.slot;
  }
});

generateTimeTableBtn.addEventListener("click", () => {
  const scheduledTasks = generateSchedule();
  renderSchedule(scheduledTasks);
});

durationButtonsBlock.addEventListener("click", (event) => {
  if (event.target.classList.contains("duration-btn")) {
    document.querySelectorAll(".duration-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");
    durationBtnValue = Number(event.target.dataset.minutes);
  }
});

addTaskBtn.addEventListener("click", (event) => {
  event.preventDefault();

  if (durationBtnValue === null || inputTitle.value === "") {
    alert("Выберите длительность задачи или напишите ее название");
    return;
  }

  let inputTitleValue = inputTitle.value;
  let inputTimeValue = durationBtnValue;
  const taskObj = {
    id: Date.now(),
    name: inputTitleValue,
    minutes: inputTimeValue,
    timeSlot: selectedTimeSlot,
  };

  tasksArr.push(taskObj);
  saveTasksToLocalStorage();

  inputTitle.value = "";
  durationBtnValue = null;
  document.querySelectorAll(".duration-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  renderTasks();
  updateGenerateBtn();
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Очистить все задачи? Это действие нельзя отменить.")) {
    tasksArr = [];
    saveTasksToLocalStorage();
    renderTasks();
    renderSchedule([]);
    updateGenerateBtn();
  }
});

renderTasks();
updateGenerateBtn();
renderSchedule([]);
