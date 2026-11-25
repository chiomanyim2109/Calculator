// Symbols shown next to the first number
const symbols = {
  add: "+",
  subtract: "\u2212",
  multiply: "\u00D7",
  divide: "\u00F7"
};

// Page elements
const currentEl = document.getElementById("current");
const expressionEl = document.getElementById("expression");
const keys = document.querySelector(".keys");

// Calculator state
let current = "0";       // the number being typed (or the last result)
let previous = null;     // the first number, waiting for the second
let operator = null;     // the operation chosen: add, subtract, multiply or divide
let overwrite = false;   // true when the next digit should start a new number
let errorText = "";      // a message such as "Cannot divide by 0"

function cleanNumber(number) {
  // Rounds away floating point noise, so 0.1 + 0.2 shows 0.3
  return String(Number(number.toPrecision(12)));
}

function updateDisplay() {
  if (errorText !== "") {
    currentEl.textContent = errorText;
    currentEl.className = "current small";
    expressionEl.textContent = "";
    return;
  }

  currentEl.textContent = current;
  expressionEl.textContent = operator !== null
    ? cleanNumber(previous) + " " + symbols[operator]
    : "";

  // Make long numbers smaller so they fit
  if (current.length > 14) {
    currentEl.className = "current small";
  } else if (current.length > 9) {
    currentEl.className = "current medium";
  } else {
    currentEl.className = "current";
  }
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  overwrite = false;
  errorText = "";
  updateDisplay();
}

function showError(message) {
  current = "0";
  previous = null;
  operator = null;
  overwrite = true;
  errorText = message;
  updateDisplay();
}

// After an error, any new input starts fresh
function startInput() {
  if (errorText !== "") {
    clearAll();
  }
}

function inputDigit(digit) {
  startInput();

  if (overwrite) {
    current = digit;
    overwrite = false;
  } else if (current === "0") {
    current = digit;
  } else {
    // Stop the number getting too long
    if (current.replace("-", "").replace(".", "").length >= 15) return;
    current += digit;
  }
  updateDisplay();
}

function inputDecimal() {
  startInput();

  if (overwrite) {
    current = "0.";
    overwrite = false;
  } else if (current.indexOf(".") === -1) {
    current += ".";
  }
  updateDisplay();
}

function compute() {
  if (operator === null) return;

  const a = previous;
  const b = parseFloat(current);
  let result;

  if (operator === "add") {
    result = a + b;
  } else if (operator === "subtract") {
    result = a - b;
  } else if (operator === "multiply") {
    result = a * b;
  } else if (operator === "divide") {
    if (b === 0) {
      showError("Cannot divide by 0");
      return;
    }
    result = a / b;
  }

  current = cleanNumber(result);
  previous = null;
  operator = null;
  overwrite = true;
}

function chooseOperator(op) {
  startInput();

  // If an operation is already waiting, finish it first (so 2 + 3 + 4 works)
  if (operator !== null && !overwrite) {
    compute();
    if (errorText !== "") return;
  }

  previous = parseFloat(current);
  operator = op;
  overwrite = true;
  updateDisplay();
}

function equals() {
  if (errorText !== "") return;
  compute();
  updateDisplay();
}

function percent() {
  startInput();
  current = cleanNumber(parseFloat(current) / 100);
  overwrite = true;
  updateDisplay();
}

function deleteLast() {
  if (errorText !== "") {
    clearAll();
    return;
  }
  if (overwrite) return;

  current = current.slice(0, -1);
  if (current === "" || current === "-") {
    current = "0";
  }
  updateDisplay();
}

// Clicks on the on-screen keys
keys.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.op !== undefined) {
    chooseOperator(button.dataset.op);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "equals") {
    equals();
  } else if (button.dataset.action === "clear") {
    clearAll();
  } else if (button.dataset.action === "delete") {
    deleteLast();
  } else if (button.dataset.action === "percent") {
    percent();
  }
});

// Keyboard support
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+") {
    chooseOperator("add");
  } else if (key === "-") {
    chooseOperator("subtract");
  } else if (key === "*") {
    chooseOperator("multiply");
  } else if (key === "/") {
    event.preventDefault();
    chooseOperator("divide");
  } else if (key === "%") {
    percent();
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  }
});

updateDisplay();