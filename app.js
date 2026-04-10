const stateSelect = document.getElementById('state');
const loginCard = document.getElementById('loginCard');
const plannerCard = document.getElementById('plannerCard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const configForm = document.getElementById('configForm');
const totalsEl = document.getElementById('totals');
const calendarEl = document.getElementById('calendar');
const stateGuidanceEl = document.getElementById('stateGuidance');
const versionBanner = document.getElementById('versionBanner');
const indianaHolidaySection = document.getElementById('indianaHolidaySection');
const indianaHolidayList = document.getElementById('indianaHolidayList');
const savedCalendarsEl = document.getElementById('savedCalendars');
const holidayDropdownBtn = document.getElementById('holidayDropdownBtn');
const saveVersionBtn = document.getElementById('saveVersionBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const APP_VERSION = '1.1';

const STATES = ['IN'];

const STATE_GUIDELINES = {
  CA: 'California often emphasizes frequent and continuing contact with both parents. Review your local county standing orders for summer exchanges.',
  TX: 'Texas possession schedules can include an extended summer possession election. Confirm deadlines and exchange times in your order.',
  FL: 'Florida parenting plans are highly customized. Confirm if your order requires specific notice periods for travel.',
  NY: 'New York courts commonly prioritize consistency and child best-interest factors. Keep holiday precedence clearly defined.',
  default: 'Always confirm this proposed calendar with your court order, mediator, or attorney before using it as a final agreement.'
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let scheduleMap = new Map();
let holidayTagMap = new Map();
let currentUser = null;

const INDIANA_HOLIDAYS = [
  { id: 'mlk', label: 'Martin Luther King Day (Fri-Mon)', rule: 'even-ncp' },
  { id: 'presidents', label: 'Presidents’ Day (Fri-Mon)', rule: 'even-ncp' },
  { id: 'memorial', label: 'Memorial Day (Fri-Mon)', rule: 'even-ncp' },
  { id: 'labor', label: 'Labor Day (Fri-Mon)', rule: 'even-ncp' },
  { id: 'thanksgiving', label: 'Thanksgiving (Wed-Sun)', rule: 'even-ncp' },
  { id: 'easter', label: 'Easter (Fri-Sun)', rule: 'odd-ncp' },
  { id: 'fourth', label: 'Fourth of July (Jul 3-5)', rule: 'odd-ncp' },
  { id: 'halloween', label: 'Halloween (Oct 31)', rule: 'odd-ncp' }
];

function getUsers() {
  return JSON.parse(localStorage.getItem('sp_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('sp_users', JSON.stringify(users));
}

function saveSession(name) {
  localStorage.setItem('sp_current_user', name);
}

function loadSession() {
  return localStorage.getItem('sp_current_user');
}

function clearSession() {
  localStorage.removeItem('sp_current_user');
}

function getSavedCalendars(name) {
  return JSON.parse(localStorage.getItem(`sp_cal_${name}`) || '[]');
}

function saveSavedCalendars(name, calendars) {
  localStorage.setItem(`sp_cal_${name}`, JSON.stringify(calendars));
}

function initStates() {
  for (const code of STATES) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    stateSelect.appendChild(option);
  }
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(date) {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseHolidayOverrides(raw) {
  const map = new Map();
  if (!raw.trim()) return map;

  const entries = raw.split(',').map((entry) => entry.trim()).filter(Boolean);
  for (const item of entries) {
    const [date, owner] = item.split(':').map((s) => s.trim());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (owner?.toUpperCase() === 'A') map.set(date, 'A');
    if (owner?.toUpperCase() === 'B') map.set(date, 'B');
  }
  return map;
}

function getSelectedIndianaHolidays() {
  return [...indianaHolidayList.querySelectorAll('input[type="checkbox"]:checked')].map((el) => el.value);
}

function nthWeekdayOfMonth(year, monthIndex, weekday, nth) {
  const first = new Date(year, monthIndex, 1);
  const offset = (7 + weekday - first.getDay()) % 7;
  return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7);
}

function lastWeekdayOfMonth(year, monthIndex, weekday) {
  const last = new Date(year, monthIndex + 1, 0);
  const offset = (7 + last.getDay() - weekday) % 7;
  return new Date(year, monthIndex, last.getDate() - offset);
}

function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getDateRange(startDate, endDate) {
  const dates = [];
  for (let d = startOfDay(startDate); d <= startOfDay(endDate); d.setDate(d.getDate() + 1)) {
    dates.push(toISO(d));
  }
  return dates;
}

function isNonCustodialHolidayYear(year, rule) {
  if (rule === 'even-ncp') return year % 2 === 0;
  return year % 2 !== 0;
}

function buildIndianaHolidayRanges(year, id) {
  if (id === 'mlk') {
    const monday = nthWeekdayOfMonth(year, 0, 1, 3);
    return getDateRange(new Date(year, 0, monday.getDate() - 3), monday);
  }
  if (id === 'presidents') {
    const monday = nthWeekdayOfMonth(year, 1, 1, 3);
    return getDateRange(new Date(year, 1, monday.getDate() - 3), monday);
  }
  if (id === 'memorial') {
    const monday = lastWeekdayOfMonth(year, 4, 1);
    return getDateRange(new Date(year, 4, monday.getDate() - 3), monday);
  }
  if (id === 'labor') {
    const monday = nthWeekdayOfMonth(year, 8, 1, 1);
    return getDateRange(new Date(year, 8, monday.getDate() - 3), monday);
  }
  if (id === 'thanksgiving') {
    const thursday = nthWeekdayOfMonth(year, 10, 4, 4);
    return getDateRange(new Date(year, 10, thursday.getDate() - 1), new Date(year, 10, thursday.getDate() + 3));
  }
  if (id === 'easter') {
    const sunday = getEasterDate(year);
    return getDateRange(new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() - 2), sunday);
  }
  if (id === 'fourth') {
    return getDateRange(new Date(year, 6, 3), new Date(year, 6, 5));
  }
  if (id === 'halloween') {
    return [toISO(new Date(year, 9, 31))];
  }
  return [];
}

function generateBaseOwner(index, splitType) {
  if (splitType === 'custom') return 'A';
  if (splitType === 'alternating-week') {
    return Math.floor(index / 7) % 2 === 0 ? 'A' : 'B';
  }

  const twoTwoThreePattern = ['A', 'A', 'B', 'B', 'A', 'B', 'B'];
  const block = Math.floor(index / 7);
  const dayInWeek = index % 7;
  if (block % 2 === 0) return twoTwoThreePattern[dayInWeek];
  return twoTwoThreePattern[dayInWeek] === 'A' ? 'B' : 'A';
}

function generateSchedule(config) {
  const start = startOfDay(config.start);
  const end = startOfDay(config.end);
  const holidayOverrides = parseHolidayOverrides(config.holidays);

  scheduleMap = new Map();
  holidayTagMap = new Map();
  let i = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISO(d);
    const owner = holidayOverrides.get(iso) ?? generateBaseOwner(i, config.splitType);
    scheduleMap.set(iso, owner);
    i += 1;
  }

  if (config.state === 'IN') {
    const selected = config.indianaHolidays || [];
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    for (let year = startYear; year <= endYear; year += 1) {
      for (const holidayId of selected) {
        const holiday = INDIANA_HOLIDAYS.find((h) => h.id === holidayId);
        if (!holiday) continue;

        const dates = buildIndianaHolidayRanges(year, holidayId);
        const owner = isNonCustodialHolidayYear(year, holiday.rule) ? 'B' : 'A';

        for (const iso of dates) {
          if (!scheduleMap.has(iso)) continue;
          scheduleMap.set(iso, owner);
          holidayTagMap.set(iso, holiday.label);
        }
      }
    }
  }
}

function renderTotals(config) {
  let totalA = 0;
  let totalB = 0;
  for (const owner of scheduleMap.values()) {
    if (owner === 'A') totalA += 1;
    else totalB += 1;
  }

  totalsEl.innerHTML = '';
  const pillA = document.createElement('div');
  pillA.className = 'total-pill';
  pillA.style.background = config.colorA;
  pillA.textContent = `${config.nameA}: ${totalA} overnights`;

  const pillB = document.createElement('div');
  pillB.className = 'total-pill';
  pillB.style.background = config.colorB;
  pillB.textContent = `${config.nameB}: ${totalB} overnights`;

  totalsEl.append(pillA, pillB);
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function renderCalendar(config) {
  calendarEl.innerHTML = '';
  const entries = [...scheduleMap.entries()].map(([iso, owner]) => ({
    iso,
    owner,
    date: new Date(`${iso}T00:00:00`)
  }));

  const grouped = new Map();
  for (const entry of entries) {
    const key = monthKey(entry.date);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(entry);
  }

  for (const monthEntries of grouped.values()) {
    const monthEl = document.createElement('article');
    monthEl.className = 'month';
    const monthDate = monthEntries[0].date;
    const heading = document.createElement('h3');
    heading.textContent = monthDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });

    const monthTotals = monthEntries.reduce((acc, entry) => {
      if (entry.owner === 'A') acc.a += 1;
      else acc.b += 1;
      return acc;
    }, { a: 0, b: 0 });

    const monthSummary = document.createElement('p');
    monthSummary.className = 'month-summary';
    monthSummary.textContent = `${config.nameA}: ${monthTotals.a} • ${config.nameB}: ${monthTotals.b}`;

    const daysEl = document.createElement('div');
    daysEl.className = 'days';

    for (const name of DOW) {
      const dowEl = document.createElement('div');
      dowEl.className = 'dow';
      dowEl.textContent = name;
      daysEl.appendChild(dowEl);
    }

    const firstOffset = monthEntries[0].date.getDay();
    for (let i = 0; i < firstOffset; i += 1) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      daysEl.appendChild(empty);
    }

    for (const entry of monthEntries) {
      const dayEl = document.createElement('button');
      dayEl.type = 'button';
      dayEl.className = 'day';
      dayEl.dataset.iso = entry.iso;
      paintDay(dayEl, entry.owner, config);
      if (holidayTagMap.has(entry.iso)) dayEl.classList.add('holiday');
      dayEl.innerHTML = `${entry.date.getDate()}<small>${entry.owner === 'A' ? config.nameA : config.nameB}</small>`;
      dayEl.addEventListener('click', () => {
        const current = scheduleMap.get(entry.iso);
        const next = current === 'A' ? 'B' : 'A';
        scheduleMap.set(entry.iso, next);
        renderTotals(config);
        renderCalendar(config);
      });
      daysEl.appendChild(dayEl);
    }

    monthEl.append(heading, monthSummary, daysEl);
    calendarEl.appendChild(monthEl);
  }
}

function paintDay(el, owner, config) {
  const color = owner === 'A' ? config.colorA : config.colorB;
  el.style.background = color;
  el.style.borderColor = color;
}

function readConfig() {
  return {
    start: document.getElementById('summerStart').value,
    end: document.getElementById('schoolStart').value,
    splitType: document.getElementById('splitType').value,
    state: document.getElementById('state').value,
    nameA: document.getElementById('custodialName').value,
    nameB: document.getElementById('nonCustodialName').value,
    colorA: document.getElementById('custodialColor').value,
    colorB: document.getElementById('nonCustodialColor').value,
    holidays: document.getElementById('holidays').value,
    indianaHolidays: getSelectedIndianaHolidays()
  };
}

function applyAccountDefaults(user) {
  if (!user) return;
  document.getElementById('state').value = 'IN';
  document.getElementById('splitType').value = 'alternating-week';

  if (user.role === 'father') {
    document.getElementById('custodialName').value = user.name;
    document.getElementById('nonCustodialName').value = 'Mother';
    document.getElementById('custodialColor').value = '#2d7ff9';
    document.getElementById('nonCustodialColor').value = '#ff79b0';
  } else if (user.role === 'mother') {
    document.getElementById('custodialName').value = user.name;
    document.getElementById('nonCustodialName').value = 'Father';
    document.getElementById('custodialColor').value = '#ff79b0';
    document.getElementById('nonCustodialColor').value = '#2d7ff9';
  } else {
    document.getElementById('custodialName').value = 'Custodial Parent';
    document.getElementById('nonCustodialName').value = 'Non-Custodial Parent';
    document.getElementById('custodialColor').value = '#2d7ff9';
    document.getElementById('nonCustodialColor').value = '#ff79b0';
  }
}

function renderSavedCalendars() {
  if (!currentUser) {
    savedCalendarsEl.innerHTML = '';
    return;
  }
  const versions = getSavedCalendars(currentUser.name);
  savedCalendarsEl.innerHTML = '<h3>Saved Calendar Versions</h3>';
  if (versions.length === 0) {
    savedCalendarsEl.innerHTML += '<p class=\"muted\">No saved versions yet.</p>';
    return;
  }
  versions
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .forEach((version) => {
      const row = document.createElement('div');
      row.className = 'saved-row';
      const stamp = new Date(version.savedAt).toLocaleString();
      row.innerHTML = `<span>${version.label} (${stamp})</span>`;

      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'secondary';
      loadBtn.textContent = 'Load';
      loadBtn.addEventListener('click', () => {
        scheduleMap = new Map(Object.entries(version.schedule || {}));
        document.getElementById('summerStart').value = version.config.start;
        document.getElementById('schoolStart').value = version.config.end;
        document.getElementById('splitType').value = version.config.splitType;
        document.getElementById('state').value = version.config.state;
        document.getElementById('custodialName').value = version.config.nameA;
        document.getElementById('nonCustodialName').value = version.config.nameB;
        document.getElementById('custodialColor').value = version.config.colorA;
        document.getElementById('nonCustodialColor').value = version.config.colorB;
        document.getElementById('holidays').value = version.config.holidays;
        const selected = new Set(version.config.indianaHolidays || []);
        for (const box of indianaHolidayList.querySelectorAll('input[type=\"checkbox\"]')) {
          box.checked = selected.has(box.value);
        }
        applyStateGuidance(version.config.state);
        renderTotals(version.config);
        renderCalendar(version.config);
      });
      row.appendChild(loadBtn);
      savedCalendarsEl.appendChild(row);
    });
}

function applyStateGuidance(state) {
  stateGuidanceEl.textContent = STATE_GUIDELINES[state] ?? STATE_GUIDELINES.default;
}

function createSharePayload(config) {
  return {
    ...config,
    schedule: Object.fromEntries(scheduleMap)
  };
}

function loadFromShare() {
  const raw = window.location.hash.replace('#share=', '');
  if (!raw) return false;
  try {
    const payload = JSON.parse(atob(decodeURIComponent(raw)));
    loginCard.classList.add('hidden');
    plannerCard.classList.remove('hidden');

    document.getElementById('summerStart').value = payload.start;
    document.getElementById('schoolStart').value = payload.end;
    document.getElementById('splitType').value = payload.splitType;
    document.getElementById('state').value = payload.state;
    document.getElementById('custodialName').value = payload.nameA;
    document.getElementById('nonCustodialName').value = payload.nameB;
    document.getElementById('custodialColor').value = payload.colorA;
    document.getElementById('nonCustodialColor').value = payload.colorB;
    document.getElementById('holidays').value = payload.holidays;
    if (payload.state === 'IN') {
      toggleIndianaHolidaySection(true);
      const selected = new Set(payload.indianaHolidays || []);
      for (const box of indianaHolidayList.querySelectorAll('input[type=\"checkbox\"]')) {
        box.checked = selected.has(box.value);
      }
    }

    scheduleMap = new Map(Object.entries(payload.schedule || {}));
    const cfg = readConfig();
    applyStateGuidance(cfg.state);
    renderTotals(cfg);
    renderCalendar(cfg);
    return true;
  } catch (err) {
    console.error('Unable to load shared link', err);
    return false;
  }
}

showLoginBtn.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

showRegisterBtn.addEventListener('click', () => {
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const custodial = document.getElementById('custodialBox').checked;
  const nonCustodial = document.getElementById('nonCustodialBox').checked;
  if (custodial === nonCustodial) {
    alert('Select either custodial or non-custodial.');
    return;
  }

  const name = document.getElementById('registerName').value.trim();
  const role = document.getElementById('registerRole').value;
  const state = document.getElementById('registerState').value;
  const password = document.getElementById('registerPassword').value;

  const users = getUsers();
  if (users.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
    alert('A profile with this name already exists.');
    return;
  }
  users.push({
    name,
    role,
    custody: custodial ? 'custodial' : 'non-custodial',
    state,
    password
  });
  saveUsers(users);
  alert('Profile created. You can now log in.');
  registerForm.reset();
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;
  const users = getUsers();
  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
  if (!user) {
    alert('Invalid name or password.');
    return;
  }
  currentUser = user;
  saveSession(user.name);
  loginCard.classList.add('hidden');
  plannerCard.classList.remove('hidden');
  applyAccountDefaults(user);
  toggleIndianaHolidaySection(true);
  applyStateGuidance('IN');
  renderSavedCalendars();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  plannerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  clearSession();
  currentUser = null;
});

configForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const config = readConfig();

  if (!config.start || !config.end || new Date(config.start) > new Date(config.end)) {
    alert('Please select a valid date range for summer break.');
    return;
  }
  if (!config.state) {
    alert('Please select a state.');
    return;
  }

  applyStateGuidance(config.state);
  generateSchedule(config);
  renderTotals(config);
  renderCalendar(config);
});

document.getElementById('shareBtn').addEventListener('click', async () => {
  const config = readConfig();
  if (scheduleMap.size === 0) {
    alert('Generate a schedule before creating a share link.');
    return;
  }

  const encoded = encodeURIComponent(btoa(JSON.stringify(createSharePayload(config))));
  const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard.');
  } catch {
    prompt('Copy this share link:', url);
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  window.print();
});

saveVersionBtn.addEventListener('click', () => {
  if (!currentUser) {
    alert('Please log in first.');
    return;
  }
  if (scheduleMap.size === 0) {
    alert('Generate a schedule before saving.');
    return;
  }
  const versions = getSavedCalendars(currentUser.name);
  const config = readConfig();
  versions.push({
    label: `Version ${versions.length + 1}`,
    savedAt: new Date().toISOString(),
    config,
    schedule: Object.fromEntries(scheduleMap)
  });
  saveSavedCalendars(currentUser.name, versions);
  renderSavedCalendars();
  alert('Calendar version saved.');
});

initStates();
initIndianaHolidays();
if (versionBanner) versionBanner.textContent = `NEW VERSION • v${APP_VERSION}`;
loadFromShare();

function initIndianaHolidays() {
  indianaHolidayList.innerHTML = '';
  for (const holiday of INDIANA_HOLIDAYS) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = holiday.id;
    label.append(checkbox, document.createTextNode(holiday.label));
    indianaHolidayList.appendChild(label);
  }
}

function toggleIndianaHolidaySection(show) {
  indianaHolidaySection.classList.toggle('hidden', !show);
}

stateSelect.addEventListener('change', (event) => {
  toggleIndianaHolidaySection(event.target.value === 'IN');
});

holidayDropdownBtn.addEventListener('click', () => {
  indianaHolidayList.classList.toggle('hidden');
});

document.getElementById('custodialBox').addEventListener('change', (event) => {
  if (event.target.checked) document.getElementById('nonCustodialBox').checked = false;
});
document.getElementById('nonCustodialBox').addEventListener('change', (event) => {
  if (event.target.checked) document.getElementById('custodialBox').checked = false;
});

const existingUserName = loadSession();
if (existingUserName) {
  const user = getUsers().find((u) => u.name === existingUserName);
  if (user) {
    currentUser = user;
    loginCard.classList.add('hidden');
    plannerCard.classList.remove('hidden');
    applyAccountDefaults(user);
    toggleIndianaHolidaySection(true);
    applyStateGuidance('IN');
    renderSavedCalendars();
  }
}
