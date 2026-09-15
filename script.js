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

  // Get the most recent check-in to evaluate today's specific habits
  const latest = checkIns[checkIns.length - 1];
  let tips = [];

  if (latest.water === 'no') {
    tips.push("💧 **Hydration Alert:** You drank less than 1 liter of water today. Make sure to grab a glass of water right now!");
  }
  if (latest.sleep === 'less-than-6') {
    tips.push("😴 **Rest Alert:** You slept for less than 6 hours. Try to get to bed earlier tonight to recharge your energy.");
  }
  if (latest.exerciseYn === 'no') {
    tips.push("🏃 **Movement Tip:** No exercise was logged today. Even a short 15-minute walk or light stretching can help.");
  }
  if (latest.nutritionYn === 'no' || latest.nutritionScore <= 2) {
    tips.push("🥗 **Nutrition Tip:** Your food choices today lean a bit unhealthy. Try adding some fresh fruits or vegetables to your next meal!");
  }

  if (tips.length === 0) {
    tips.push("🌟 **Great Job Today!** You hit your water, sleep, and activity goals. Keep up the brilliant consistency!");
  }

  // Render tips cleanly without raw markdown symbols
  tipsBox.innerHTML = tips.join("<br><br>");
}

// Initial load check
updateInsights();