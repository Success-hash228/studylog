const form = document.getElementById('session-form');
const subjectInput = document.getElementById('subject');
const durationInput = document.getElementById('duration');
const sessionList = document.getElementById('session-list');
const totalTimeDisplay = document.getElementById('total-time');

let sessions = JSON.parse(localStorage.getItem('sessions')) || [];

function renderSessions() {
  sessionList.innerHTML = '';
  let total = 0;

  sessions.forEach(session => {
    const li = document.createElement('li');
    li.textContent = `${session.subject}: ${session.duration} minutes`;
    sessionList.appendChild(li);
    total += session.duration;
  });

  totalTimeDisplay.textContent = total;
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
