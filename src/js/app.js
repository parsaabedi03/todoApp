//  DOM ELEMENTS
const todoListEl = document.getElementById("todoList");
const addBtn = document.getElementById("addTodoButton");
const editBtn = document.getElementById("editTodoButton");
const priorityBtns = document.querySelectorAll(".priorityButton");
const filterBtns = document.querySelectorAll(".filterButton");

//  LOCAL STORAGE HELPERS
// Get data from Local Storage (returns array or empty array if not found)
const loadFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];

// Save data to Local Storage
const saveToStorage = (key, data) =>
  localStorage.setItem(key, JSON.stringify(data));

//  STATE
let currentPriority = "medium";

//  PRIORITY HANDLING
// Handle priority button click
const handlePriorityClick = (event) => {
  const selectedPriority = event.target.dataset.priority;
  currentPriority = selectedPriority || "low";
  highlightPriorityButton(currentPriority);
};

// Return Tailwind color class based on priority
const getPriorityColorClass = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    default:
      return "bg-green-500";
  }
};

// Highlight active priority button
const highlightPriorityButton = (priority) => {
  const highlightClasses = [
    "ring-red-500",
    "ring-2",
    "ring-offset-2",
    "ring-offset-neutral-800",
  ];
  priorityBtns.forEach((btn) => {
    btn.classList.remove(...highlightClasses);
    if (btn.dataset.priority === priority)
      btn.classList.add(...highlightClasses);
  });
};

//  ADD TASK
// Handle adding a new task
const handleAddTodo = () => {
  const todoInput = document.getElementById("todoInput");
  const dateInput = document.getElementById("todoDateInput");
  const now = new Date();

  if (!todoInput.value.trim()) return console.log("Please fill in the input");

  const newTodo = {
    id: Date.now(),
    text: todoInput.value.trim(),
    status: "unfinished",
    date:
      dateInput.value ||
      `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
    priority: currentPriority,
  };

  const todos = loadFromStorage("todos");
  todos.push(newTodo);
  saveToStorage("todos", todos);

  // Reset form
  todoInput.value = "";
  dateInput.value = "";
  currentPriority = "medium";
  highlightPriorityButton(currentPriority);

  renderTodos(loadFromStorage("todos"));
};

//  FILTERING
// Handle filter button click
const handleFilterClick = (event) => {
  const selectedFilter = event.target.dataset.filter;
  const todos = loadFromStorage("todos");

  const selectedClasses = ["bg-indigo-600", "text-white", "shadow-lg"];
  const defaultClasses = [
    "bg-neutral-800",
    "text-gray-400",
    "hover:bg-neutral-700",
  ];

  filterBtns.forEach((btn) => {
    btn.classList.remove(...selectedClasses);
    btn.classList.add(...defaultClasses);
  });

  event.target.classList.remove(...defaultClasses);
  event.target.classList.add(...selectedClasses);

  if (selectedFilter === "all") {
    renderTodos(todos);
  } else {
    renderTodos(todos.filter((todo) => todo.status === selectedFilter));
  }
};

//  STATUS ICONS
// Return SVG icon based on status
const getStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-check-icon lucide-check"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>`;
    case "in-progress":
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-play-icon lucide-play"
        >
          <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
        </svg>`;
    default:
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-circle-icon lucide-circle"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>`;
  }
};

//  RENDERING
// Render todos in the DOM
const renderTodos = (todos) => {
  todoListEl.innerHTML = "";

  if (!todos.length) {
    todoListEl.innerHTML = `<p class="text-center text-gray-500 text-lg py-12">Looks like there are no tasks here.</p>`;
    return;
  }

  let html = "";
  todos.forEach((todo) => {
    html += `
    <div class="todoCard relative flex flex-col justify-between p-4 rounded-xl shadow-lg border border-neutral-700 transition-all duration-300 ${
      todo.status === "completed"
        ? "bg-neutral-800 opacity-60"
        : "bg-neutral-800 hover:bg-neutral-700"
    }">

      <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${getPriorityColorClass(
        todo.priority
      )}"></div>

      <div class="flex items-start justify-between space-x-4 flex-grow pl-4">
      
        <button class="statusButton flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors duration-200 flex items-center justify-center mt-1 ${
          todo.status === "completed"
            ? "border-green-500 bg-green-500 text-white"
            : todo.status === "in-progress"
            ? "border-yellow-500 bg-yellow-500 text-white"
            : "border-gray-500 text-gray-500"
        }" 
        data-id="${todo.id}"
        aria-label=${`Change status for todo: ${todo.text}`}>
        ${getStatusIcon(todo.status)}
        </button>

        <div class="flex flex-col flex-grow">
          <span class="text-lg text-gray-200 ${
            todo.status === "completed" ? "line-through text-gray-500" : ""
          }">
          ${todo.text}
          </span>
        </div>

        <div class="flex space-x-2 self-start">
            <button
            class="editButton p-1 text-gray-500 hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
            data-id="${todo.id}"
            aria-label="Edit task"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button
            class="deleteButton p-1 text-gray-500 hover:text-red-500 transition-colors duration-200 cursor-pointer"
            data-id="${todo.id}"
            aria-label="Delete task"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
        
      </div>
      <div class="flex justify-between items-center mt-2 pl-12">
        <span class="text-sm text-gray-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar mr-1"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          ${todo.date}
        </span>
      </div>
    </div>
    `;
  });
  todoListEl.innerHTML = html;
};

//  DELETE TASK
const deleteTodo = (todo) => {
  const todos = loadFromStorage("todos").filter((t) => t.id !== todo.id);
  saveToStorage("todos", todos);
  renderTodos(todos);
};

//  EDIT TASK
const editTodo = (todo) => {
  const todoInput = document.getElementById("todoInput");
  const dateInput = document.getElementById("todoDateInput");

  todoInput.value = todo.text;
  dateInput.value = formatDate(todo.date);
  currentPriority = todo.priority;
  highlightPriorityButton(currentPriority);

  editBtn.classList.remove("hidden");
  addBtn.classList.add("hidden");

  const newClickHandler = () => {
    const todos = loadFromStorage("todos").map((t) =>
      t.id === todo.id
        ? {
            ...t,
            text: todoInput.value,
            date: dateInput.value,
            priority: currentPriority,
          }
        : t
    );
    saveToStorage("todos", todos);
    renderTodos(todos);

    todoInput.value = "";
    dateInput.value = "";
    currentPriority = "medium";
    highlightPriorityButton(currentPriority);

    editBtn.classList.add("hidden");
    addBtn.classList.remove("hidden");

    editBtn.removeEventListener("click", newClickHandler);
  };

  editBtn.addEventListener("click", newClickHandler);
};

//  STATUS TOGGLE
const toggleTodoStatus = (todo) => {
  const todos = loadFromStorage("todos").map((t) => {
    if (t.id === todo.id) {
      switch (t.status) {
        case "completed":
          return { ...t, status: "unfinished" };
        case "in-progress":
          return { ...t, status: "completed" };
        default:
          return { ...t, status: "in-progress" };
      }
    }
    return t;
  });
  saveToStorage("todos", todos);
  renderTodos(todos);
};

//  EVENT DELEGATION
const setupTodoListEvents = (container) => {
  container.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".deleteButton");
    const editBtnEl = event.target.closest(".editButton");
    const statusBtn = event.target.closest(".statusButton");

    const todos = loadFromStorage("todos");

    if (deleteBtn) {
      const todo = todos.find((t) => t.id === Number(deleteBtn.dataset.id));
      if (todo) deleteTodo(todo);
    }

    if (editBtnEl) {
      const todo = todos.find((t) => t.id === Number(editBtnEl.dataset.id));
      if (todo) editTodo(todo);
    }

    if (statusBtn) {
      const todo = todos.find((t) => t.id === Number(statusBtn.dataset.id));
      if (todo) toggleTodoStatus(todo);
    }
  });
};

//  UTIL
function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

//  INITIAL SETUP
window.addEventListener("load", () => {
  addBtn.addEventListener("click", handleAddTodo);
  priorityBtns.forEach((btn) =>
    btn.addEventListener("click", handlePriorityClick)
  );
  filterBtns.forEach((btn) => btn.addEventListener("click", handleFilterClick));
  highlightPriorityButton(currentPriority);
  renderTodos(loadFromStorage("todos"));
  setupTodoListEvents(todoListEl);
});
