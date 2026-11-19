const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("prediction-form");
const submitBtn = document.getElementById("submit-btn");
const errorBox = document.getElementById("error-box");
const resultCard = document.getElementById("result-card");
const scoreValueEl = document.getElementById("score-value");
const scoreNoteEl = document.getElementById("score-note");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  resultCard.classList.add("hidden");
}

function clearMessages() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function validatePayload(payload) {
  if (!Number.isInteger(payload.age) || payload.age < 10 || payload.age > 100) {
    return "Age must be a whole number between 10 and 100.";
  }
  if (!payload.country) {
    return "Please enter or select a country.";
  }
  if (Number.isNaN(payload.avg_daily_usage_hours) || payload.avg_daily_usage_hours < 0 || payload.avg_daily_usage_hours > 24) {
    return "Average daily usage hours must be between 0 and 24.";
  }
  if (!Number.isInteger(payload.daily_unlocks) || payload.daily_unlocks < 0) {
    return "Daily unlocks must be a whole number greater than or equal to 0.";
  }
  if (Number.isNaN(payload.study_hours) || payload.study_hours < 0 || payload.study_hours > 24) {
    return "Study hours must be between 0 and 24.";
  }
  if (Number.isNaN(payload.physical_activity_hours) || payload.physical_activity_hours < 0 || payload.physical_activity_hours > 24) {
    return "Physical activity hours must be between 0 and 24.";
  }
  if (Number.isNaN(payload.sleep_hours_per_night) || payload.sleep_hours_per_night < 0 || payload.sleep_hours_per_night > 24) {
    return "Sleep hours per night must be between 0 and 24.";
  }
  return null;
}

form.addEventListener("reset", () => {
  clearMessages();
  resultCard.classList.add("hidden");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const payload = {
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    country: document.getElementById("country").value.trim(),
    academic_level: document.getElementById("academic_level").value,
    most_used_platform: document.getElementById("most_used_platform").value,
    purpose_of_use: document.getElementById("purpose_of_use").value,
    avg_daily_usage_hours: Number(document.getElementById("avg_daily_usage_hours").value),
    daily_unlocks: Number(document.getElementById("daily_unlocks").value),
    study_hours: Number(document.getElementById("study_hours").value),
    physical_activity_hours: Number(document.getElementById("physical_activity_hours").value),
    sleep_hours_per_night: Number(document.getElementById("sleep_hours_per_night").value),
    stress_level: document.getElementById("stress_level").value,
  };

  const validationError = validatePayload(payload);
  if (validationError) {
    showError(validationError);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Predicting...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map((err) => `${err.loc.join(".")}: ${err.msg}`).join("; ")
        : data.detail || `Server responded with status ${response.status}`;
      throw new Error(detail);
    }

    const score = Number(data.predicted_mental_health_score);
    scoreValueEl.textContent = score.toFixed(2);
    scoreNoteEl.textContent = `Prediction generated for a ${payload.age}-year-old ${payload.academic_level.toLowerCase()} student in ${payload.country}.`;
    resultCard.classList.remove("hidden");
  } catch (error) {
    const isNetworkError = error instanceof TypeError;
    showError(
      isNetworkError
        ? "Could not connect to the FastAPI backend at http://127.0.0.1:8000. Make sure Uvicorn is running."
        : error.message
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Predict Mental Health Score";
  }
});