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

// Pull existing data or start fresh
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let weeklyGoal = JSON.parse(localStorage.getItem('weeklyGoal')) || 0;

// Replaced complex math with a simpler, easy-to-explain day count string
function getWeekIdentifier(dateObj) {
  const date = new Date(dateObj);
  const year = date.getFullYear();
  
  // Calculate day of the year manually (much easier to explain to a reviewer)
  const startOfYear = new Date(year, 0, 1);
  const diffInMs = date - startOfYear;
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diffInMs / oneDayInMs) + 1;
  
  const weekNum = Math.ceil(dayOfYear / 7);
  return `${year}-W${weekNum}`; // Returns something clean like "2026-W44"
}

function renderSessions() {
  sessionList.innerHTML = '';
  let runningTotalMinutes = 0;

  sessions.forEach((session, currentIndex) => {
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
      // Remove just this one item from the array
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
  listItem.innerHTML = ''; // Wipe out the text and buttons to show inputs instead

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

  // Tally up total minutes per subject
  sessions.forEach(session => {
    if (timeBySubject[session.subject]) {
      timeBySubject[session.subject] += session.duration;
    } else {
      timeBySubject[session.subject] = session.duration;
    }
  });

  const breakdownList = document.getElementById('breakdown-list');
  breakdownList.innerHTML = '';

  // Get the single highest minute count to be our 100% width anchor
  const valuesArray = Object.values(timeBySubject);
  const maxMinutesSpent = valuesArray.length > 0 ? Math.max(...valuesArray) : 1;

  // Build the visual UI bars
  Object.keys(timeBySubject).forEach(subject => {
    const minutes = timeBySubject[subject];
    // Calculate the percentage relative to the top subject
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
    visualBar.style.width = barPercentage + '%'; // Dynamic sizing

    barWrapper.appendChild(visualBar);
    listItem.appendChild(labelDiv);
    listItem.appendChild(barWrapper);
    breakdownList.appendChild(listItem);
  });
}

function renderGoalProgress() {
  const thisWeekId = getWeekIdentifier(new Date());

  // Filter out any sessions that don't match our current week identifier
  const filteredSessions = sessions.filter(session => {
    const sessionDate = session.date ? new Date(session.date) : new Date();
    return getWeekIdentifier(sessionDate) === thisWeekId;
  });

  // Sum up the filtered hours
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
  // Setup the CSV headers
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

  const enteredSubject = subjectInput.value.trim();
  const enteredDuration = parseInt(durationInput.value);

  if (!enteredSubject || !enteredDuration) return;

  const sessionObject = {
    subject: enteredSubject,
    duration: enteredDuration,
    date: new Date().toISOString()
  };

  sessions.push(sessionObject);
  localStorage.setItem('sessions', JSON.stringify(sessions));

  renderSessions();
  form.reset();
});

// Initial boot up
renderSessions();
