const soundTada = new Audio('tada.mp3');

// Inicializace účtů – ulož předvytvořeného instruktora a uživatele
function initUsers() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (!users.some(u => u.email === 'instruktor@email.cz')) {
    users.push({ email: 'instruktor@email.cz', password: 'instruktor@email.cz', role: 'instructor' });
    localStorage.setItem('users', JSON.stringify(users));
  }
  if (!users.some(u => u.email === 'a')) {
    users.push({ email: 'a', password: 'a', role: 'user' });
    localStorage.setItem('users', JSON.stringify(users));
  }
  if (!users.some(u => u.email === 'b')) {
    users.push({ email: 'b', password: 'b', role: 'user' });
    localStorage.setItem('users', JSON.stringify(users));
  }
}
initUsers();

let currentUser;

const authBtns = document.getElementById('auth-buttons');
const logoutBtn = document.getElementById('logout-btn');
const createLessonBtn = document.getElementById('create-lesson-btn');

document.getElementById('login-btn').onclick = () => {
  openModal('login-modal');
};

document.getElementById('logout-btn').onclick = () => {
  localStorage.removeItem('currentUser');
  updateHeader();
};


document.getElementById('register-btn').onclick = () => {
  openModal('register-modal');
};

document.getElementById('register-submit').onclick = () => {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    alert('Tento e-mail je již registrován.');
    return;
  }
  const newUser = { email, password, role: 'user' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registrace byla úspěšná. Nyní se přihlaste.');
  closeModal('register-modal');
};

document.getElementById('login-submit').onclick = () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    closeModal('login-modal');
    updateHeader();
  } else {
    alert('Nesprávné přihlašovací údaje.');
  }
};

document.getElementById('modal-close').onclick = () => {
  closeModal('lesson-modal');
};

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  if(id == 'lesson-modal') {
    const newUrl = window.location.origin + '/Reservario';
    history.pushState({ page: 'base'}, '', newUrl);
  }
  updateHeader();
}


function updateHeader() {
  currentUser = JSON.parse(localStorage.getItem('currentUser') || null);
  const userInfo = document.getElementById('user-info');
  
  if (currentUser != null) {
    logoutBtn.style.display = 'inline-block';
    authBtns.style.display = 'none';
    userInfo.textContent = `Přihlášen jako: ${currentUser.email}`;
  } else { // user is guest -> don't show lessons
    logoutBtn.style.display = 'none';
    authBtns.style.display = 'inline-block';
    userInfo.textContent = ``;
  }

  // show create lesson button only for instructors
  if (currentUser && currentUser.role && currentUser.role === 'instructor') {
    createLessonBtn.style.display = 'inline-block';
  } else {
    createLessonBtn.style.display = 'none';
  }

  renderCalendar();
  renderLessonList();
}



let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

const monthLabel = document.getElementById('month-label');
const prevBtn = document.getElementById('prev-month');
prevBtn.appendChild(createArrowSVG('left'));
const nextBtn = document.getElementById('next-month');
nextBtn.appendChild(createArrowSVG('right'));

let lessons = JSON.parse(localStorage.getItem('lessons') || '[]');
const calendarEl = document.getElementById('calendar');

// Zobrazuje dny v aktuálním měsíci, u dne jsou zobrazené vypsané lekce
function renderCalendar() {
  const year = currentYear;
  const month = currentMonth;

  const monthNames = [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
  ];

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const showLessons = currentUser !== null;

  calendarEl.innerHTML = '';

  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    const emptyCell = document.createElement('div');
    calendarEl.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    const dateStr = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;

    // Přidej číslo dne
    const dayNumber = document.createElement('strong');
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    if (showLessons) { // jen pokud je někdo přihlášen
      const sortedLessons = [...lessons].sort((a, b) => new Date(a.date) - new Date(b.date));
      const lessonEls = sortedLessons
        .filter(lesson => lesson.date.startsWith(dateStr))
        .map(lesson => {
          const div = document.createElement('div');
          div.className = 'lesson-entry';
          if (lesson.date < flatpickr.formatDate(new Date(), "d-m-Y H:i")) {
            div.classList.add('lesson-past');
          } else if (lesson.participants?.includes(currentUser?.email)) {
            div.classList.add('lesson-signed');
          } else if (lesson.participants?.length >= lesson.capacity) {
            div.classList.add('lesson-full');
          } else {
            div.classList.add('lesson-available');
          }
          div.textContent = `${lesson.title} (${lesson.date.slice(11, 16)})`;
          div.onclick = () => showLessonDetails(lesson.id);
          return div;
        });

      lessonEls.forEach(el => dayEl.appendChild(el));
    }

    calendarEl.appendChild(dayEl);
  }
}

// tlačítka pro posun kalendáře
prevBtn.onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
};
nextBtn.onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
};

// otvře modální okno s detaily dané lekce
function showLessonDetails(lessonId) {
  const lesson = lessons.find(lesson => lesson.id === lessonId);
  if (lesson == null) {
    window.location.href = 'notfound.html';
  }
      
  const newUrl = window.location.origin + `/Reservario/lessons/${lesson.id}`;
  history.pushState({ page: 'lessonDetail', id: lesson.id }, '', newUrl);

  const modal = document.getElementById('lesson-modal');
  const detail = document.getElementById('lesson-detail');
  const participantCount = lesson.participants?.length || 0;
  const participantList = (lesson.participants || [])
    .map(email => `<li>${email}</li>`)
    .join('');

  // instruktor může měnit hodnoty, uživatel se může přihlásit/odhlásit
  if (currentUser && currentUser.role && currentUser.role === 'instructor') { 
    detail.innerHTML = `
      <label>Název <input id="edit-title-cal" value="${lesson.title}"></label><br>
      <label>Datum a čas <input id="edit-date-cal" value="${lesson.date}"></label><br>
      <label>Kapacita <input id="edit-capacity-cal" type="number" value="${lesson.capacity}"></label><br>
      <label>Popis <input id="edit-description-cal" value="${lesson.description}"></label><br>
      <p>Obsazenost ${participantCount} / ${lesson.capacity}</p>
      <ul>${participantList}</ul>
      <button onclick="saveLessonEdit('${lesson.id}', 'cal')">Uložit</button>
      <button onclick="deleteLesson('${lesson.id}')">Smazat</button>
    `;

    // user-friendly date/time picker
    flatpickr("#edit-date-cal", {
      enableTime: true,
      dateFormat: "d-m-Y H:i",
      time_24hr: true,
      defaultDate: lesson.date
    });
  } else { // user (not instructor)
    const alreadyJoined = (lesson.participants || []).includes(currentUser.email);
    const capacityFull = participantCount >= lesson.capacity ? true : false;
    detail.innerHTML = `
      <h3>${lesson.title}</h3>
      <p>Popis: ${lesson.description}</p>
      <p>Datum a čas: ${lesson.date}</p>
      <p>Kapacita: ${lesson.capacity}</p>
      <p>Obsazenost: ${participantCount}</p>
      ${lesson.date < flatpickr.formatDate(new Date(), "d-m-Y H:i")
        ? `<p>Událost již proběhla</p>`
        : alreadyJoined
        ? `<button onclick="toggleJoin('${lesson.id}')">Odhlásit se</button>`
        : capacityFull ? `<p>Plně obsazeno</p>`
        : `<button onclick="toggleJoin('${lesson.id}')">Přihlásit se</button>`
      }`;
  }

  modal.classList.remove('hidden');
}

function saveLessonEdit(lessonId, modalId) {
  const index = lessons.findIndex(l => l.id === lessonId);
  if (index === -1) return;

  lessons[index].title = document.getElementById(`edit-title-${modalId}`).value;
  lessons[index].description = document.getElementById(`edit-description-${modalId}`).value;
  lessons[index].date = document.getElementById(`edit-date-${modalId}`).value;
  lessons[index].capacity = parseInt(document.getElementById(`edit-capacity-${modalId}`).value);

  localStorage.setItem('lessons', JSON.stringify(lessons));
  closeModal('lesson-modal');

  renderCalendar();
  renderLessonList();
}

// join/leave lesson
function toggleJoin(id) {
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) return;

  const participants = lessons[index].participants || [];
  const i = participants.indexOf(currentUser.email);
  if (i >= 0) {
    participants.splice(i, 1);
  } else {
    if (participants.length < lessons[index].capacity) {
      participants.push(currentUser.email);
      soundTada.play();
    } else {
      alert("Kapacita naplněna!");
    }
  }
  lessons[index].participants = participants;

  localStorage.setItem('lessons', JSON.stringify(lessons));
  renderCalendar();
  renderLessonList();
  closeModal('lesson-modal');
}

createLessonBtn.onclick = () => {
  const newLesson = {
    id: Date.now().toString(),
    title: 'Nová lekce',
    date: flatpickr.formatDate(new Date(), "d-m-Y H:i"),
    capacity: 8,
    attendees: [],
    description: 'Popis lekce'
  };
  lessons.push(newLesson);
  localStorage.setItem('lessons', JSON.stringify(lessons));
  renderCalendar();
  renderLessonList();
  showLessonDetails(newLesson.id);
};

function deleteLesson(lessonId) {
  if (!confirm("Opravdu chcete tuto lekci smazat?")) return;

  lessons = lessons.filter(lesson => lesson.id !== lessonId);
  localStorage.setItem('lessons', JSON.stringify(lessons));

  renderCalendar();
  renderLessonList();
  closeModal('lesson-modal');
}


let expandedLessonId = null;

// show list of future lessons also below calendar, can show/hide details on click
function renderLessonList() {
  const listEl = document.getElementById('lesson-list');
  listEl.innerHTML = '';

  let visibleLessons = currentUser ? lessons : [];
  visibleLessons = [...visibleLessons].sort((a, b) => new Date(a.date) - new Date(b.date));
  visibleLessons = visibleLessons.filter(lesson => lesson.date > flatpickr.formatDate(new Date(), "d-m-Y H:i"));

  visibleLessons.forEach(lesson => {
    const isExpanded = expandedLessonId === lesson.id;

    const container = document.createElement('div');
    container.className = 'lesson-row';
    if (isExpanded) container.classList.add('expanded');

    const header = document.createElement('div');
    header.className = 'lesson-header';

    let status; 
    if (lesson.date < flatpickr.formatDate(new Date(), "d-m-Y H:i")) {
      status = 'status-past';
    } else if (lesson.participants?.includes(currentUser?.email)) {
      status = 'status-signed';
    } else if (lesson.participants?.length >= lesson.capacity) {
      status = 'status-full';
    } else {
      status = 'status-available';
    }

    header.innerHTML = `
      <span class="lesson-status ${status}"></span>
      <span class="lesson-date"><strong>${lesson.date}</strong></span>
      <span class="lesson-title">${lesson.title}</span>
      <span class="lesson-arrow">${isExpanded ? '▲' : '▼'}</span>
    `;
    header.onclick = () => {
      if (expandedLessonId === lesson.id) {
        expandedLessonId = null;
      } else {
        expandedLessonId = lesson.id;
      }
      renderLessonList();
    };

    container.appendChild(header);

    if (isExpanded) { // show details, instructor can edit data
      const participantCount = (lesson.participants || []).length;
      const capacityFull = participantCount >= lesson.capacity;

      const detail = document.createElement('div');
      detail.className = 'lesson-details';

      if (currentUser && currentUser.role === 'instructor') {
        const participantList = (lesson.participants || []).map(email => `<li>${email}</li>`).join('');

        detail.innerHTML = `
          <label>Název <input id="edit-title-list" value="${lesson.title}"></label><br>
          <label>Datum a čas <input id="edit-date-list" value="${lesson.date}"></label><br>
          <label>Kapacita <input id="edit-capacity-list" type="number" value="${lesson.capacity}"></label><br>
          <label>Popis <input id="edit-description-list" value="${lesson.description}"></label><br>
          <p>Obsazenost ${participantCount} / ${lesson.capacity}</p>
          <ul>${participantList}</ul>
          <button onclick="saveLessonEdit('${lesson.id}', 'list')">Uložit</button>
          <button onclick="deleteLesson('${lesson.id}')">Smazat</button>
        `;

        setTimeout(() => {
          flatpickr("#edit-date-list", {
            enableTime: true,
            dateFormat: "d-m-Y H:i",
            time_24hr: true,
            defaultDate: lesson.date
          });
        }, 0);
      } else { // just user not instructor
        const alreadyJoined = lesson.participants && lesson.participants.includes(currentUser?.email);

        detail.innerHTML = `
          <p><strong>Popis:</strong> ${lesson.description}</p>
          <p><strong>Kapacita:</strong> ${lesson.capacity}</p>
          <p><strong>Přihlášeno:</strong> ${participantCount}</p>
          ${lesson.date < flatpickr.formatDate(new Date(), "d-m-Y H:i")
            ? `<p>Událost již proběhla</p>`
            : alreadyJoined
            ? `<button onclick="toggleJoin('${lesson.id}')">Odhlásit se</button>`
            : capacityFull ? `<p>Plně obsazeno</p>`
            : `<button onclick="toggleJoin('${lesson.id}')">Přihlásit se</button>`
          }
        `;
      }

      container.appendChild(detail);
    }

    listEl.appendChild(container);
  });
}


// Určí, jaký stav aplikace má být načten na základě URL
function initializeAppStateFromUrl() {
  handleOnlineStatusChange();
  const path = window.location.pathname;

  if (path === '/Reservario' || path === '/Reservario/') {
    updateHeader();
    expandedLessonId = null;
    if (document.getElementById('lesson-modal')) {
       document.getElementById('lesson-modal').classList.add('hidden');
    }
    history.replaceState({ page: 'base' }, '', path);
  } else if (path.startsWith('/Reservario/lessons')) {
    const lessonId = path.split('/Reservario/lessons')[1];
    if (lessonId && lessons.some(lesson => lesson.id === lessonId)) {
      updateHeader();
      showLessonDetails(lessonId);    
      pageState = { page: 'lessonDetail', id: lessonId };
      history.replaceState({ page: 'lessonDetail', id: lessonId }, '', path);
    } else {
      window.location.href = 'notfound.html';
    }
  } else {
    window.location.href = 'notfound.html';
  }
}

// po načtení DOM inicializuj aplikaci
document.addEventListener('DOMContentLoaded', initializeAppStateFromUrl);

window.addEventListener('popstate', function(event) {
  const state = event.state;

  if (state) {
    switch (state.page) {
      case 'lessonDetail':
        if (state.id && lessons.some(l => l.id === state.id)) {
          updateHeader();
          showLessonDetails(state.id);
        }  else {
          window.location.href = 'notfound.html';
        }
        break;
      case 'base':
        document.getElementById('lesson-modal').classList.add('hidden');
        updateHeader();
        break;
      default:
        window.location.href = 'notfound.html';
        break;
    }
  } else {
    initializeAppStateFromUrl();
  }
});


// Vytvoří šipky pro posun kalendáře
function createArrowSVG(direction) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24"); 
  svg.setAttribute("width", "24"); 
  svg.setAttribute("height", "24");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  if (direction === 'left') {
    path.setAttribute("d", "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z");
  } else if (direction === 'right') {
      path.setAttribute("d", "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z");
  }

  svg.appendChild(path);
  return svg;
}


window.addEventListener('offline', handleOnlineStatusChange);
function displayOfflineMessage() {
  const statusElement = document.getElementById('network-status');
  if (statusElement) {
    statusElement.textContent = "Jste offline. Aplikace nemusí fungovat správně.";
    statusElement.style.display = 'block';
  }
}

window.addEventListener('online', handleOnlineStatusChange);
function displayOnlineMessage() {
  const statusElement = document.getElementById('network-status');
  if (statusElement) {
    statusElement.textContent = "";
    statusElement.style.display = 'none';
  }
}

function handleOnlineStatusChange() {
  if (navigator.onLine) {
    console.log("Jste online.");
    displayOnlineMessage();
  } else {
    console.log("Jste offline.");
    displayOfflineMessage();
  }
}