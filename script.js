// --- WELLNESS HUB SCRIPT ---

let checkIns = JSON.parse(localStorage.getItem('wellness_checkins')) || [];

function toggleExerciseDetails() {
  const yn = document.getElementById('exercise-yn').value;
  const details = document.getElementById('exercise-details');
  details.style.display = (yn === 'yes') ? 'block' : 'none';
}

function toggleNutritionDetails() {
  const yn = document.getElementById('nutrition-yn').value;
  const details = document.getElementById('nutrition-details');
  details.style.display = (yn === 'yes') ? 'block' : 'none';
}

const checkinForm = document.getElementById('checkin-form');
if (checkinForm) {
  checkinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const todayStr = new Date().toDateString();
    const existingIndex = checkIns.findIndex(c => c.date === todayStr);

    const water = document.getElementById('water-input').value;
    const exerciseYn = document.getElementById('exercise-yn').value;
    const exerciseType = document.getElementById('exercise-type').value.trim();
    const exerciseMinutes = parseInt(document.getElementById('exercise-minutes').value) || 0;
    const nutritionYn = document.getElementById('nutrition-yn').value;
    const nutritionScore = parseInt(document.getElementById('nutrition-score').value) || 3;
    const sleep = document.getElementById('sleep-input').value;

    const entry = {
      date: todayStr,
      water,
      exerciseYn,
      exerciseType: exerciseYn === 'yes' ? exerciseType : 'None',
      exerciseMinutes: exerciseYn === 'yes' ? exerciseMinutes : 0,
      nutritionYn,
      nutritionScore: nutritionYn === 'yes' ? nutritionScore : 1,
      sleep,
      timestamp: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      checkIns[existingIndex] = entry; 
    } else {
      checkIns.push(entry);
    }

    localStorage.setItem('wellness_checkins', JSON.stringify(checkIns));
    
    const feedback = document.getElementById('form-feedback');
    feedback.style.color = "#10b981";
    feedback.innerText = "Check-in saved successfully! 🎉";
    setTimeout(() => { feedback.innerText = ""; }, 3000);

    updateInsights();
  });
}

// --- SMART MEAL RATER LOGIC ---
const mealForm = document.getElementById('meal-form');
if (mealForm) {
  mealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mealText = document.getElementById('meal-input').value.toLowerCase();
    const resultBox = document.getElementById('meal-result-box');
    const scoreBadge = document.getElementById('meal-score-badge');
    const breakdownText = document.getElementById('meal-breakdown-text');
    const suggestionText = document.getElementById('meal-suggestion-text');

    let score = 7; // Default baseline score
    let breakdown = "Your meal has a nice balance of nutrients.";
    let suggestion = "💡 Tip: Try adding a glass of water or some healthy fats to complete this meal!";

    // Keyword detection rules for smart feedback
    if (mealText.includes('egg') || mealText.includes('chicken') || mealText.includes('meat') || mealText.includes('fish') || mealText.includes('protein')) {
      score += 1;
      breakdown = "🥚 Protein source detected: High-quality protein supports muscle maintenance and keeps you full longer.";
    } else if (mealText.includes('chips') || mealText.includes('candy') || mealText.includes('soda') || mealText.includes('burger')) {
      score -= 3;
      breakdown = "⚠️ High processed food content detected, which can lead to quick energy crashes.";
      suggestion = "💡 Tip: Try swapping processed snacks for whole foods like nuts, fruit, or vegetables.";
    }

    if (mealText.includes('peach') || mealText.includes('apple') || mealText.includes('banana') || mealText.includes('fruit') || mealText.includes('vegetable') || mealText.includes('salad')) {
      score += 1;
      breakdown += " Plus, the fruit/vegetables provide essential vitamins, fiber, and antioxidants.";
      suggestion = "💡 Tip: This is a healthy combination! To make it even more filling, try pairing it with a handful of whole grains or nuts.";
    }

    // Keep score within 1-10 range
    if (score > 10) score = 10;
    if (score < 1) score = 1;

    scoreBadge.innerText = `${score} / 10`;
    breakdownText.innerText = breakdown;
    suggestionText.innerText = suggestion;
    resultBox.style.display = 'block';
  });
}

function updateInsights() {
  const weeklyValEl = document.getElementById('weekly-score-val');
  const monthlyValEl = document.getElementById('monthly-score-val');
  const tipsBox = document.getElementById('feedback-tips-box');

  if (checkIns.length === 0) return;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const recentCheckins = checkIns.filter(c => new Date(c.timestamp) >= sevenDaysAgo);
  weeklyValEl.innerText = `${recentCheckins.length} / 7 days`;
  monthlyValEl.innerText = `${checkIns.length} days`;

  const latest = checkIns[checkIns.length - 1];
  let tips = [];

  if (latest.water === 'no') {
    tips.push("💧 Hydration Alert: You drank less than 1 liter of water today. Make sure to grab a glass of water right now!");
  }
  if (latest.sleep === 'less-than-6') {
    tips.push("😴 Rest Alert: You slept for less than 6 hours. Try to get to bed earlier tonight to recharge your energy.");
  }
  if (latest.exerciseYn === 'no') {
    tips.push("🏃 Movement Tip: No exercise was logged today. Even a short 15-minute walk or light stretching can help.");
  }
  if (latest.nutritionYn === 'no' || latest.nutritionScore <= 2) {
    tips.push("🥗 Nutrition Tip: Your food choices today lean a bit unhealthy. Try adding some fresh fruits or vegetables to your next meal!");
  }

  if (tips.length === 0) {
    tips.push("🌟 Great Job Today! You hit your water, sleep, and activity goals. Keep up the brilliant consistency!");
  }

  tipsBox.innerHTML = tips.join("<br><br>");
}

updateInsights();