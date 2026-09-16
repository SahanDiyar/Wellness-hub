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

// --- SMART MEAL RATER LOGIC (MULTI-MEAL) ---
const mealForm = document.getElementById('meal-form');
if (mealForm) {
  mealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawText = document.getElementById('meal-input').value.trim();
    const resultBox = document.getElementById('meal-result-box');

    if (!rawText) return;

    // Split text by lines so each line/meal is evaluated separately
    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    let resultsHTML = '';

    lines.forEach(line => {
      const mealTextLower = line.toLowerCase();
      let score = 7;
      let breakdown = "Meal has a decent balance of nutrients.";
      let suggestion = "💡 Tip: Try adding a glass of water or healthy fats to complete this meal!";

      // Keyword detection rules
      if (mealTextLower.includes('egg') || mealTextLower.includes('chicken') || mealTextLower.includes('meat') || mealTextLower.includes('fish') || mealTextLower.includes('protein')) {
        score += 1;
        breakdown = "🥚 Protein source detected: High-quality protein supports muscle maintenance and keeps you full.";
      } else if (mealTextLower.includes('chips') || mealTextLower.includes('candy') || mealTextLower.includes('soda') || mealTextLower.includes('burger')) {
        score -= 3;
        breakdown = "⚠️ High processed food content detected, which can lead to energy crashes.";
        suggestion = "💡 Tip: Try swapping processed snacks for whole foods like nuts, fruit, or vegetables.";
      }

      if (mealTextLower.includes('peach') || mealTextLower.includes('apple') || mealTextLower.includes('banana') || mealTextLower.includes('fruit') || mealTextLower.includes('vegetable') || mealTextLower.includes('salad') || mealTextLower.includes('grapes')) {
        score += 1;
        breakdown += " Includes vitamins, fiber, and antioxidants.";
        suggestion = "💡 Tip: Great choice of produce! Pairing it with whole grains or healthy proteins makes it even better.";
      }

      // Keep score within bounds
      if (score > 10) score = 10;
      if (score < 1) score = 1;

      // Build individual card HTML for this specific meal line
      resultsHTML += `
        <div style="background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 1rem; color: var(--text-color);">${escapeHtml(line)}</h4>
            <span style="background: var(--primary); color: white; padding: 3px 9px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${score} / 10</span>
          </div>
          <p style="margin: 6px 0; line-height: 1.4; font-size: 0.9rem; color: var(--text-sub);">${breakdown}</p>
          <p style="margin: 6px 0 0 0; line-height: 1.4; font-size: 0.9rem; font-weight: 500; color: #047857;">${suggestion}</p>
        </div>
      `;
    });

    resultBox.innerHTML = `<h3 style="margin-top: 0; font-size: 1.1rem; color: var(--primary); margin-bottom: 12px;">Analysis Results</h3>` + resultsHTML;
    resultBox.style.display = 'block';
  });
}

// Helper function to keep text safe
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
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