const form = document.getElementById('session-form');
const subjectInput = document.getElementById('subject');
const durationInput = document.getElementById('duration');
const sessionList = document.getElementById('session-list');
const totalTimeDisplay = document.getElementById('total-time');
const goalInput = document.getElementById('goal-input');
const setGoalBtn = document.getElementById('set-goal-btn');
const progressBar = document.getElementById('progress-bar');
const goalText = document.getElementById('goal-text');
const exportBtn = document.getElementById('export-btn');
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let weeklyGoal = JSON.parse(localStorage.getItem('weeklyGoal')) || 0;

function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function renderSessions() {
  sessionList.innerHTML = '';
  let total = 0;

  sessions.forEach((session, index) => {
    const li = document.createElement('li');
    li.textContent = `${session.subject}: ${session.duration} minutes `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
      sessions.splice(index, 1);
      localStorage.setItem('sessions', JSON.stringify(sessions));
      renderSessions();
    });

    li.appendChild(deleteBtn);
    sessionList.appendChild(li);
    total += session.duration;
  });

  totalTimeDisplay.textContent = total;
  renderBreakdown();
  renderGoalProgress();
  function exportToCSV() {
    let csvContent = "Subject,Duration (minutes),Date\n";
  
    sessions.forEach(session => {
      const dateStr = session.date ? new Date(session.date).toLocaleDateString() : "N/A";
      csvContent += `${session.subject},${session.duration},${dateStr}\n`;
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study_sessions.csv';
    link.click();
  
    URL.revokeObjectURL(url);
  }
  
  exportBtn.addEventListener('click', exportToCSV);
}

function renderBreakdown() {
  const breakdown = {};

  sessions.forEach(session => {
    if (breakdown[session.subject]) {
      breakdown[session.subject] += session.duration;
    } else {
      breakdown[session.subject] = session.duration;
    }
  });

  const breakdownList = document.getElementById('breakdown-list');
  breakdownList.innerHTML = '';

  for (const subject in breakdown) {
    const li = document.createElement('li');
    li.textContent = `${subject}: ${breakdown[subject]} minutes`;
    breakdownList.appendChild(li);
  }
}

function renderGoalProgress() {
  const currentWeek = getWeekNumber(new Date());

  const thisWeekSessions = sessions.filter(session => {
    return getWeekNumber(new Date(session.date)) === currentWeek;
  });

  const weekTotal = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);

  if (weeklyGoal > 0) {
    const percent = Math.min((weekTotal / weeklyGoal) * 100, 100);
    progressBar.style.width = percent + '%';
    goalText.textContent = `${weekTotal} / ${weeklyGoal} minutes this week (${Math.round(percent)}%)`;
  } else {
    progressBar.style.width = '0%';
    goalText.textContent = 'Set a weekly goal to start tracking progress.';
  }
}

setGoalBtn.addEventListener('click', function() {
  const goal = parseInt(goalInput.value);
  if (goal > 0) {
    weeklyGoal = goal;
    localStorage.setItem('weeklyGoal', JSON.stringify(weeklyGoal));
    renderGoalProgress();
    goalInput.value = '';
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const subject = subjectInput.value;
  const duration = parseInt(durationInput.value);

  const newSession = {
    subject: subject,
    duration: duration,
    date: new Date().toISOString()
  };

  sessions.push(newSession);
  localStorage.setItem('sessions', JSON.stringify(sessions));

  renderSessions();

  form.reset();
});

renderSessions();