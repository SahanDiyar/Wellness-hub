// --- WELLNESS HUB SCRIPT ---

let checkIns = JSON.parse(localStorage.getItem('wellness_checkins')) || [];

// --- THEME TOGGLE LOGIC ---
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  if (newTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('wellness_theme', 'dark');
    document.getElementById('theme-toggle-btn').innerText = '☀️ Light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('wellness_theme', 'light');
    document.getElementById('theme-toggle-btn').innerText = '🌙 Dark';
  }
}

// Load saved theme on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('wellness_theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerText = '☀️ Light';
  }
});

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
    feedback.style.color = "var(--primary)";
    feedback.innerText = "Check-in saved successfully! 🎉";
    setTimeout(() => { feedback.innerText = ""; }, 3000);

    updateInsights();
  });
}

// --- SMART MEAL RATER LOGIC (ADVANCED MULTI-MEAL) ---
const mealForm = document.getElementById('meal-form');
if (mealForm) {
  mealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawText = document.getElementById('meal-input').value.trim();
    const resultBox = document.getElementById('meal-result-box');

    if (!rawText) return;

    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    let resultsHTML = '';

    lines.forEach(line => {
      const text = line.toLowerCase();
      let score = 6;
      let breakdownParts = [];
      let suggestion = "";

      // 1. Check for Proteins
      const hasProtein = text.includes('egg') || text.includes('chicken') || text.includes('meat') || text.includes('fish') || text.includes('protein') || text.includes('turkey') || text.includes('tofu');
      if (hasProtein) {
        score += 2;
        breakdownParts.push("🥚 Excellent protein source detected to support muscle recovery and fullness.");
      }

      // 2. Check for Produce (Fruits & Veggies)
      const hasProduce = text.includes('apple') || text.includes('peach') || text.includes('banana') || text.includes('fruit') || text.includes('salad') || text.includes('vegetable') || text.includes('spinach') || text.includes('broccoli') || text.includes('grapes') || text.includes('tomato') || text.includes('cucumber');
      if (hasProduce) {
        score += 2;
        breakdownParts.push("🥗 Rich in vitamins, fiber, and antioxidants from fresh produce.");
      }

      // 3. Check for Grains & Carbs
      const hasCarbs = text.includes('rice') || text.includes('bread') || text.includes('toast') || text.includes('oats') || text.includes('pasta') || text.includes('potato');
      if (hasCarbs) {
        score += 1;
        breakdownParts.push("🌾 Contains healthy carbohydrates for sustained energy.");
      }

      // 4. Check for Junk / Processed Sugars
      const hasJunk = text.includes('cake') || text.includes('chips') || text.includes('candy') || text.includes('soda') || text.includes('chocolate') || text.includes('cookie') || text.includes('donut') || text.includes('cookies');
      if (hasJunk) {
        score -= 3;
        breakdownParts.push("⚠️ High in refined sugars and processed fats, which can cause energy spikes and crashes.");
        suggestion = "💡 Tip: Try swapping this sugary snack for a piece of fruit or Greek yogurt.";
      }

      // 5. Check for Drinks / Caffeine only (like Iced Coffee)
      const hasDrink = text.includes('coffee') || text.includes('iced coffee') || text.includes('ice coffee') || text.includes('latte') || text.includes('tea') || text.includes('espresso');
      const hasSolidFood = hasProtein || hasProduce || hasCarbs || text.includes('toast') || text.includes('cereal') || text.includes('yogurt') || text.includes('oatmeal');
      
      if (hasDrink && !hasSolidFood) {
        score = 4;
        breakdownParts.push("☕ Contains caffeine, but lacks nutritional substance and calories needed for a meal.");
        suggestion = "💡 Tip: This is just a caffeinated drink, not an actual meal! Try pairing it with some solid food or protein for proper fuel.";
      }

      if (breakdownParts.length === 0) {
        breakdownParts.push("🍽️ General meal entry logged.");
      }

      // Smart Targeted Suggestions
      if (!suggestion) {
        if (hasProtein && hasCarbs && !hasProduce) {
          suggestion = "💡 Tip: Great protein and carb combo! Try adding some fresh vegetables or a side salad to get your daily vitamins.";
        } else if (text.includes('salad') && !hasProtein) {
          suggestion = "💡 Tip: This salad is light! Try adding some grilled chicken, beans, or eggs for an extra protein boost.";
        } else if (hasProtein && hasProduce) {
          suggestion = "💡 Tip: Well-balanced meal! Pairing it with whole grains can make it even more satisfying.";
        } else {
          suggestion = "💡 Tip: Make sure to stay hydrated with a glass of water alongside this meal!";
        }
      }

      if (score > 10) score = 10;
      if (score < 1) score = 1;

      let badgeColor = 'var(--primary)';
      if (score < 6) badgeColor = '#ef4444';
      else if (score < 8) badgeColor = '#f59e0b';

      resultsHTML += `
        <div style="background: var(--card-bg); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="margin: 0; font-size: 1rem; color: var(--text-color);">${escapeHtml(line)}</h4>
            <span style="background: ${badgeColor}; color: white; padding: 3px 9px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${score} / 10</span>
          </div>
          <p style="margin: 6px 0; line-height: 1.4; font-size: 0.9rem; color: var(--text-sub);">${breakdownParts.join(" ")}</p>
          <p style="margin: 6px 0 0 0; line-height: 1.4; font-size: 0.9rem; font-weight: 500; color: var(--primary);">${suggestion}</p>
        </div>
      `;
    });

    resultBox.innerHTML = `<h3 style="margin-top: 0; font-size: 1.1rem; color: var(--primary); margin-bottom: 12px;">Analysis Results</h3>` + resultsHTML;
    resultBox.style.display = 'block';
  });
}

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
    tips.push("💧 Hydration Alert: You drank less than 2 liters of water today. Make sure to grab a glass of water right now!");
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