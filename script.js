const form = document.getElementById('session-form');
const subjectInput = document.getElementById('subject');
const durationInput = document.getElementById('duration');
const sessionList = document.getElementById('session-list');
const totalTimeDisplay = document.getElementById('total-time');

let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

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

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const subject = subjectInput.value;
  const duration = parseInt(durationInput.value);

  const newSession = {
    subject: subject,
    duration: duration
  };

  sessions.push(newSession);
  localStorage.setItem('sessions', JSON.stringify(sessions));

  renderSessions();

  form.reset();
});

renderSessions();