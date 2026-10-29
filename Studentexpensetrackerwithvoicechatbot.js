
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "spendsmart_transactions_v1";
const BUDGET_KEY = "spendsmart_budget_v1";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

let transactions = [];
let budget = 0;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  transactions = Array.isArray(saved) ? saved.filter((t) =>
    t && typeof t.id === "string" &&
    ["income", "expense"].includes(t.type) &&
    Number.isFinite(Number(t.amount)) &&
    Number(t.amount) > 0 &&
    typeof t.title === "string" &&
    typeof t.date === "string"
  ) : [];
} catch {
  transactions = [];
}

try {
  const savedBudget = Number(localStorage.getItem(BUDGET_KEY));
  budget = Number.isFinite(savedBudget) && savedBudget > 0 ? savedBudget : 0;
} catch {
  budget = 0;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    localStorage.setItem(BUDGET_KEY, String(budget));
  } catch {
    alert("Browser storage unavailable. Your changes may not be saved.");
  }
}

function getTotals() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expenses, savings: income - expenses };
}

function getMonthExpenses() {
  const month = today().slice(0, 7);
  return transactions
    .filter(t => t.type === "expense" && t.date.slice(0, 7) === month)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

const icons = {
  Food: "🍔",
  Travel: "🚌",
  Shopping: "🛍️",
  Education: "📚",
  Hostel: "🏠",
  Entertainment: "🎬",
  Health: "💊",
  Other: "💳"
};

function render() {
  const { income, expenses, savings } = getTotals();

  $("balance").textContent = currency(savings);
  $("income").textContent = currency(income);
  $("expenses").textContent = currency(expenses);
  $("savings").textContent = currency(savings);

  renderTransactions();
  renderBudget();
  renderCategories();
}

function renderTransactions() {
  const list = $("transactionList");
  list.replaceChildren();

  const sorted = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );

  if (!sorted.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No transactions yet. Add your first entry!";
    list.append(empty);
    return;
  }

  sorted.slice(0, 30).forEach(t => {
    const row = document.createElement("div");
    row.className = "transaction";

    const icon = document.createElement("div");
    icon.className = "transaction-icon";
    icon.textContent = t.type === "income" ? "💰" : (icons[t.category] || "💳");

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("strong");
    title.textContent = t.title;

    const detail = document.createElement("small");
    detail.textContent = `${t.category} · ${t.date}`;

    info.append(title, detail);

    const amount = document.createElement("div");
    amount.className = "transaction-amount " +
      (t.type === "income" ? "income-text" : "expense-text");
    amount.textContent = `${t.type === "income" ? "+" : "−"}${currency(Number(t.amount))}`;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "×";
    del.title = "Delete transaction";
    del.setAttribute("aria-label", `Delete ${t.title}`);
    del.addEventListener("click", () => deleteTransaction(t.id));

    row.append(icon, info, amount, del);
    list.append(row);
  });
}

function renderBudget() {
  const spent = getMonthExpenses();
  const percent = budget > 0 ? (spent / budget) * 100 : 0;

  $("budgetSpent").textContent = currency(spent);
  $("budgetInput").value = budget || "";

  const progress = $("budgetProgress");
  progress.style.width = `${Math.min(percent, 100)}%`;
  progress.classList.toggle("over-budget", percent > 100);

  if (!budget) {
    $("budgetMessage").textContent = "Set a budget to start tracking.";
  } else if (percent > 100) {
    $("budgetMessage").textContent =
      `Budget exceeded by ${currency(spent - budget)}. Try reducing spending.`;
  } else {
    $("budgetMessage").textContent =
      `${currency(budget - spent)} remaining (${Math.round(percent)}% used).`;
  }
}

function renderCategories() {
  const chart = $("categoryChart");
  chart.replaceChildren();

  const totals = {};

  transactions
    .filter(t => t.type === "expense" && t.date.slice(0, 7) === today().slice(0, 7))
    .forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Add an expense to see your monthly category chart.";
    chart.append(empty);
    return;
  }

  entries.forEach(([category, amount]) => {
    const row = document.createElement("div");
    row.className = "category-row";

    const label = document.createElement("div");
    label.className = "category-label";

    const name = document.createElement("span");
    name.textContent = `${icons[category] || "💳"} ${category}`;

    const value = document.createElement("strong");
    value.textContent = currency(amount);

    label.append(name, value);

    const track = document.createElement("div");
    track.className = "category-track";

    const fill = document.createElement("div");
    fill.className = "category-fill";
    fill.style.width = `${(amount / total) * 100}%`;

    track.append(fill);
    row.append(label, track);
    chart.append(row);
  });
}

function addTransaction({ type, title, amount, category, date }) {
  amount = Number(amount);

  if (!["income", "expense"].includes(type) ||
      !Number.isFinite(amount) || amount <= 0 ||
      !title.trim() || !date) {
    return false;
  }

  transactions.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: title.trim().slice(0, 80),
    amount,
    category: type === "income" ? "Other" : category,
    date
  });

  persist();
  render();
  return true;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  persist();
  render();
}

function openExpenseDialog(type = "expense") {
  $("transactionForm").reset();
  $("type").value = type;
  $("date").value = today();
  $("expenseDialog").showModal();
  $("title").focus();
}

$("openExpense").addEventListener("click", () => openExpenseDialog());
$("closeDialog").addEventListener("click", () => $("expenseDialog").close());

$("type").addEventListener("change", () => {
  $("category").disabled = $("type").value === "income";
});

$("transactionForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const success = addTransaction({
    type: $("type").value,
    title: $("title").value,
    amount: $("amount").value,
    category: $("category").value,
    date: $("date").value
  });

  if (success) $("expenseDialog").close();
});

$("budgetForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = Number($("budgetInput").value);

  if (!Number.isFinite(value) || value <= 0) {
    alert("Please enter a valid budget.");
    return;
  }

  budget = value;
  persist();
  renderBudget();
});

$("clearAll").addEventListener("click", () => {
  if (!transactions.length) {
    alert("There are no transactions to clear.");
    return;
  }

  if (confirm("Delete all transactions? This cannot be undone.")) {
    transactions = [];
    persist();
    render();
  }
});

// ---------------- VOICE CHATBOT ----------------

function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `message ${sender}-message`;
  message.textContent = text;
  $("chatWindow").append(message);
  $("chatWindow").scrollTop = $("chatWindow").scrollHeight;
}

function normalize(text) {
  return text.toLowerCase().replace(/[₹,]/g, " ").trim();
}

function categoryFromText(text) {
  const value = normalize(text);

  const categories = [
    ["Food", /\b(food|lunch|dinner|breakfast|snack|pizza|canteen|chai|coffee|khana)\b/],
    ["Travel", /\b(travel|bus|train|metro|auto|cab|petrol|transport|fare)\b/],
    ["Shopping", /\b(shopping|clothes|dress|shoes|shopping)\b/],
    ["Education", /\b(education|college|books|book|fees|course|stationery|exam)\b/],
    ["Hostel", /\b(hostel|rent|room|laundry)\b/],
    ["Entertainment", /\b(movie|entertainment|game|netflix|outing)\b/],
    ["Health", /\b(health|medicine|doctor|medical)\b/]
  ];

  return categories.find(([, pattern]) => pattern.test(value))?.[0] || "Other";
}

function parseAmount(text) {
  const value = normalize(text);

  // Support digits and common spoken English number words.
  const digitMatch = value.match(/\b\d+(?:\.\d+)?\b/);
  if (digitMatch) return Number(digitMatch[0]);

  const words = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
    nineteen: 19, twenty: 20, thirty: 30, forty: 40,
    fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    hundred: 100, thousand: 1000
  };

  const tokens = value.match(/\b[a-z]+\b/g) || [];
  const start = tokens.findIndex(word => Object.hasOwn(words, word));

  if (start < 0) return NaN;

  let total = 0;
  let current = 0;

  for (const word of tokens.slice(start)) {
    if (!(word in words)) {
      if (current || total) break;
      continue;
    }

    const number = words[word];

    if (number === 100) {
      current = Math.max(1, current) * 100;
    } else if (number === 1000) {
      total += Math.max(1, current) * 1000;
      current = 0;
    } else {
      current += number;
    }
  }

  return total + current;
}

function handleCommand(rawText) {
  const text = normalize(rawText);
  if (!text) return "Please type or say a command.";

  if (/\b(help|commands|what can you do)\b/.test(text)) {
    return "Try: 'Add expense 100 rupees for food', 'Add income 5000', 'What is my balance?', 'How much did I spend?', or 'Show my savings'.";
  }

  if (/\b(balance|how much money|how much do i have)\b/.test(text)) {
    return `Your available balance is ${currency(getTotals().savings)}.`;
  }

  if (/\b(saving|savings)\b/.test(text)) {
    return `Your current net savings are ${currency(getTotals().savings)}.`;
  }

  if (/\b(how much did i spend|total expense|total expenses|spending|spent)\b/.test(text)) {
    return `Your total recorded expenses are ${currency(getTotals().expenses)}. This month's expenses are ${currency(getMonthExpenses())}.`;
  }

  if (/\b(total income|my income|money received)\b/.test(text)) {
    return `Your total recorded income is ${currency(getTotals().income)}.`;
  }

  const incomeCommand = /\b(add|record|save|log|enter)\b/.test(text) &&
    /\b(income|salary|pocket money|received|deposit)\b/.test(text);

  const expenseCommand = /\b(add|record|save|log|spend|spent|expense|buy|bought)\b/.test(text) &&
    /\b(expense|spend|spent|buy|bought|for|rupees|rupee|rs|food|travel|shopping|lunch|dinner|bus|book|hostel|fees|medicine|coffee|chai)\b/.test(text);

  if (incomeCommand || expenseCommand) {
    const amount = parseAmount(text);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Please include a valid amount, for example: Add expense 100 rupees for food.";
    }

    const type = incomeCommand ? "income" : "expense";
    const category = type === "income" ? "Other" : categoryFromText(text);

    const title = type === "income"
      ? "Voice-added income"
      : `${category} expense`;

    const success = addTransaction({
      type,
      title,
      amount,
      category,
      date: today()
    });

    if (!success) return "Sorry, I could not add that entry. Please try again.";

    return `${type === "income" ? "Income" : "Expense"} added successfully: ${currency(amount)}${type === "expense" ? ` for ${category}` : ""}. Your balance is ${currency(getTotals().savings)}.`;
  }

  return "I didn't understand that command. Try 'Add expense 100 for food' or tap a quick command below.";
}

function sendCommand(text) {
  if (!text.trim()) return;

  addMessage(text, "user");
  const response = handleCommand(text);
  addMessage(response, "bot");
  $("chatInput").value = "";
}

$("sendChat").addEventListener("click", () => {
  sendCommand($("chatInput").value);
});

$("chatInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendCommand($("chatInput").value);
});

document.querySelectorAll(".chip").forEach(button => {
  button.addEventListener("click", () => {
    sendCommand(button.dataset.command);
  });
});

// Browser voice recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  let listening = false;

  recognition.onstart = () => {
    listening = true;
    $("micButton").classList.add("listening");
    $("voiceStatus").textContent = "Listening... Speak your command.";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    $("chatInput").value = transcript;
    sendCommand(transcript);
  };

  recognition.onerror = (event) => {
    $("voiceStatus").textContent =
      event.error === "not-allowed"
        ? "Microphone permission denied. Allow microphone access in your browser."
        : `Voice recognition error: ${event.error}. You can type a command instead.`;
  };

  recognition.onend = () => {
    listening = false;
    $("micButton").classList.remove("listening");
    if ($("voiceStatus").textContent.startsWith("Listening")) {
      $("voiceStatus").textContent = "Voice recognition stopped. Tap the microphone to try again.";
    }
  };

  $("micButton").addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }

    try {
      $("voiceStatus").textContent = "Starting microphone...";
      recognition.start();
    } catch {
      $("voiceStatus").textContent =
        "Could not start microphone. Wait a moment and try again.";
    }
  });
} else {
  $("micButton").disabled = true;
  $("voiceStatus").textContent =
    "Voice recognition is not supported in this browser. Try desktop Chrome or use typed commands.";
}

render();
