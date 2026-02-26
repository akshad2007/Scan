// LocalStorage keys kept in constants for easier maintenance.
const STORAGE_KEYS = {
  users: "cropDoctorUsers",
  currentUser: "cropDoctorCurrentUser",
  history: "cropDoctorHistory"
};

// Mock disease list for prototype AI output.
const diseases = [
  {
    name: "Tomato Early Blight",
    suggestion: "Remove affected leaves and apply a copper-based fungicide weekly."
  },
  {
    name: "Leaf Spot",
    suggestion: "Avoid overhead watering and use disease-free seeds next cycle."
  },
  {
    name: "Powdery Mildew",
    suggestion: "Improve airflow and spray sulfur or neem-based treatment."
  },
  {
    name: "Healthy",
    suggestion: "No disease detected. Maintain current watering and nutrition practices."
  }
];

const landingSection = document.getElementById("landingSection");
const authSection = document.getElementById("authSection");
const detectionSection = document.getElementById("detectionSection");
const startBtn = document.getElementById("startBtn");
const loginToggle = document.getElementById("loginToggle");
const signupToggle = document.getElementById("signupToggle");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const analyzeBtn = document.getElementById("analyzeBtn");
const loader = document.getElementById("loader");
const resultCard = document.getElementById("resultCard");
const diseaseNameEl = document.getElementById("diseaseName");
const confidenceTextEl = document.getElementById("confidenceText");
const confidenceBar = document.getElementById("confidenceBar");
const treatmentTextEl = document.getElementById("treatmentText");
const historyList = document.getElementById("historyList");

let isSignupMode = false;
let uploadedImageData = "";

// Utility function to parse JSON from localStorage safely.
function getParsedStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function setAuthMode(signupMode) {
  isSignupMode = signupMode;
  authTitle.textContent = signupMode ? "Signup" : "Login";
  authSubmitBtn.textContent = signupMode ? "Create Account" : "Login";
  signupToggle.classList.toggle("active", signupMode);
  loginToggle.classList.toggle("active", !signupMode);
  authMessage.textContent = "";
}

function showDetectionScreen() {
  landingSection.classList.add("hidden");
  authSection.classList.add("hidden");
  detectionSection.classList.remove("hidden");
  renderHistory();
}

function showAuthScreen() {
  landingSection.classList.add("hidden");
  authSection.classList.remove("hidden");
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Please enter both email and password.";
    return;
  }

  const users = getParsedStorage(STORAGE_KEYS.users, []);
  const existingUser = users.find((user) => user.email === email);

  if (isSignupMode) {
    if (existingUser) {
      authMessage.textContent = "Account already exists. Please login.";
      return;
    }

    users.push({ email, password });
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.currentUser, email);
    authMessage.textContent = "Signup successful. Redirecting...";

    setTimeout(showDetectionScreen, 500);
    return;
  }

  if (!existingUser || existingUser.password !== password) {
    authMessage.textContent = "Invalid login credentials.";
    return;
  }

  localStorage.setItem(STORAGE_KEYS.currentUser, email);
  authMessage.textContent = "Login successful. Redirecting...";
  setTimeout(showDetectionScreen, 500);
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    analyzeBtn.disabled = true;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    uploadedImageData = reader.result;
    imagePreview.src = uploadedImageData;
    imagePreview.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
    analyzeBtn.disabled = false;
    resultCard.classList.add("hidden");
  };

  reader.readAsDataURL(file);
}

function generateMockResult() {
  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
  const confidence = Math.floor(Math.random() * 15) + 85;

  return {
    ...randomDisease,
    confidence
  };
}

function savePrediction(result) {
  const history = getParsedStorage(STORAGE_KEYS.history, []);
  const entry = {
    image: uploadedImageData,
    disease: result.name,
    confidence: result.confidence,
    suggestion: result.suggestion,
    time: new Date().toLocaleString()
  };

  history.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
  const history = getParsedStorage(STORAGE_KEYS.history, []);

  if (!history.length) {
    historyList.innerHTML = '<div class="history-empty">No predictions yet.</div>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
      <article class="history-item">
        <img src="${item.image}" alt="Prediction thumbnail" />
        <div class="history-meta">
          <strong>${item.disease}</strong><br />
          Confidence: ${item.confidence}%<br />
          <small>${item.time}</small>
        </div>
      </article>
    `
    )
    .join("");
}

function handleAnalyzeClick() {
  if (!uploadedImageData) {
    return;
  }

  loader.classList.remove("hidden");
  resultCard.classList.add("hidden");
  analyzeBtn.disabled = true;

  // Simulate API delay to mimic real model processing.
  setTimeout(() => {
    const result = generateMockResult();

    loader.classList.add("hidden");
    analyzeBtn.disabled = false;

    diseaseNameEl.textContent = result.name;
    confidenceTextEl.textContent = `${result.confidence}%`;
    treatmentTextEl.textContent = result.suggestion;
    confidenceBar.style.width = `${result.confidence}%`;

    resultCard.classList.remove("hidden");

    savePrediction(result);
    renderHistory();
  }, 2000);
}

function initialize() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);

  if (currentUser) {
    showDetectionScreen();
  }

  startBtn.addEventListener("click", showAuthScreen);
  loginToggle.addEventListener("click", () => setAuthMode(false));
  signupToggle.addEventListener("click", () => setAuthMode(true));
  authForm.addEventListener("submit", handleAuthSubmit);
  imageInput.addEventListener("change", handleImageUpload);
  analyzeBtn.addEventListener("click", handleAnalyzeClick);
}

initialize();
