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
const clearAllBtn = document.getElementById('clear-all-btn');

let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let weeklyGoal = JSON.parse(localStorage.getItem('weeklyGoal')) || 0;

function getWeekIdentifier(dateObj) {
  const date = new Date(dateObj);
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const diffInMs = date - startOfYear;
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diffInMs / oneDayInMs) + 1;
  const weekNum = Math.ceil(dayOfYear / 7);
  return `${year}-W${weekNum}`;
}

function renderSessions() {
  sessionList.innerHTML = '';
  let runningTotalMinutes = 0;

  document.getElementById('session-count').textContent = sessions.length;

  if (sessions.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.textContent = 'No sessions logged yet — add one above!';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#999';
    emptyMsg.style.background = 'none';
    sessionList.appendChild(emptyMsg);
  }

  [...sessions].reverse().forEach((session, reversedIndex) => {
    const currentIndex = sessions.length - 1 - reversedIndex;
    const listItem = document.createElement('li');

    const textSpan = document.createElement('span');
    textSpan.textContent = `${session.subject}: ${session.duration} minutes`;
    listItem.appendChild(textSpan);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function() {
      triggerEditMode(currentIndex, listItem);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
      sessions.splice(currentIndex, 1);
      localStorage.setItem('sessions', JSON.stringify(sessions));
      renderSessions();
    });

    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    sessionList.appendChild(listItem);

    runningTotalMinutes += session.duration;
  });

  totalTimeDisplay.textContent = runningTotalMinutes;
  renderBreakdown();
  renderGoalProgress();
}

function triggerEditMode(index, listItem) {
  const currentSession = sessions[index];
  listItem.innerHTML = '';

  const subjectEditInput = document.createElement('input');
  subjectEditInput.type = 'text';
  subjectEditInput.value = currentSession.subject;

  const durationEditInput = document.createElement('input');
  durationEditInput.type = 'number';
  durationEditInput.value = currentSession.duration;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', function() {
    sessions[index].subject = subjectEditInput.value;
    sessions[index].duration = parseInt(durationEditInput.value) || 0;
    localStorage.setItem('sessions', JSON.stringify(sessions));
    renderSessions();
  });

  listItem.appendChild(subjectEditInput);
  listItem.appendChild(durationEditInput);
  listItem.appendChild(saveBtn);
}

function renderBreakdown() {
  const timeBySubject = {};

  sessions.forEach(session => {
    if (timeBySubject[session.subject]) {
      timeBySubject[session.subject] += session.duration;
    } else {
      timeBySubject[session.subject] = session.duration;
    }
  });

  const breakdownList = document.getElementById('breakdown-list');
  breakdownList.innerHTML = '';

  const valuesArray = Object.values(timeBySubject);
  const maxMinutesSpent = valuesArray.length > 0 ? Math.max(...valuesArray) : 1;

  Object.keys(timeBySubject).forEach(subject => {
    const minutes = timeBySubject[subject];
    const barPercentage = (minutes / maxMinutesSpent) * 100;

    const listItem = document.createElement('li');
    listItem.classList.add('breakdown-item');

    const labelDiv = document.createElement('div');
    labelDiv.classList.add('breakdown-label');
    labelDiv.textContent = `${subject}: ${minutes} minutes`;

    const barWrapper = document.createElement('div');
    barWrapper.classList.add('breakdown-bar-container');

    const visualBar = document.createElement('div');
    visualBar.classList.add('breakdown-bar');
    visualBar.style.width = barPercentage + '%';

    barWrapper.appendChild(visualBar);
    listItem.appendChild(labelDiv);
    listItem.appendChild(barWrapper);
    breakdownList.appendChild(listItem);
  });
}

function renderGoalProgress() {
  const thisWeekId = getWeekIdentifier(new Date());

  const filteredSessions = sessions.filter(session => {
    const sessionDate = session.date ? new Date(session.date) : new Date();
    return getWeekIdentifier(sessionDate) === thisWeekId;
  });

  const totalMinutesThisWeek = filteredSessions.reduce((sum, item) => sum + item.duration, 0);

  if (weeklyGoal > 0) {
    const calculatedPercent = Math.min((totalMinutesThisWeek / weeklyGoal) * 100, 100);
    progressBar.style.width = calculatedPercent + '%';
    goalText.textContent = `${totalMinutesThisWeek} / ${weeklyGoal} minutes logged (${Math.round(calculatedPercent)}%)`;
  } else {
    progressBar.style.width = '0%';
    goalText.textContent = 'Set a weekly goal to start tracking progress.';
  }
}

function exportToCSV() {
  let csvDataString = "Subject,Duration (minutes),Date\n";

  sessions.forEach(session => {
    const printedDate = session.date ? new Date(session.date).toLocaleDateString() : "N/A";
    csvDataString += `${session.subject},${session.duration},${printedDate}\n`;
  });

  const rawBlob = new Blob([csvDataString], { type: 'text/csv' });
  const downloadUrl = URL.createObjectURL(rawBlob);

  const temporaryLink = document.createElement('a');
  temporaryLink.href = downloadUrl;
  temporaryLink.download = 'study_sessions.csv';
  temporaryLink.click();

  URL.revokeObjectURL(downloadUrl);
}

exportBtn.addEventListener('click', exportToCSV);

clearAllBtn.addEventListener('click', function() {
  if (confirm('Are you sure you want to delete all sessions? This cannot be undone.')) {
    sessions = [];
    localStorage.setItem('sessions', JSON.stringify(sessions));
    renderSessions();
  }
});

setGoalBtn.addEventListener('click', function() {
  const customGoalValue = parseInt(goalInput.value);
  if (customGoalValue > 0) {
    weeklyGoal = customGoalValue;
    localStorage.setItem('weeklyGoal', JSON.stringify(weeklyGoal));
    renderGoalProgress();
    goalInput.value = '';
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const subject = subjectInput.value.trim();
  const duration = parseInt(durationInput.value);

  if (!subject || duration <= 0 || isNaN(duration)) {
    alert('Please enter a valid subject and a duration greater than 0.');
    return;
  }

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