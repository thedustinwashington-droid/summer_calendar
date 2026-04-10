const stateSelect = document.getElementById('state');
const loginCard = document.getElementById('loginCard');
const plannerCard = document.getElementById('plannerCard');
const loginForm = document.getElementById('loginForm');
const configForm = document.getElementById('configForm');
const totalsEl = document.getElementById('totals');
const calendarEl = document.getElementById('calendar');
const stateGuidanceEl = document.getElementById('stateGuidance');

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN',
  'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
  'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
  'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const STATE_GUIDELINES = {
  CA: 'California often emphasizes frequent and continuing contact with both parents. Review your local county standing orders for summer exchanges.',
  TX: 'Texas possession schedules can include an extended summer possession election. Confirm deadlines and exchange times in your order.',
  FL: 'Florida parenting plans are highly customized. Confirm if your order requires specific notice periods for travel.',
  NY: 'New York courts commonly prioritize consistency and child best-interest factors. Keep holiday precedence clearly defined.',
  default: 'Always confirm this proposed calendar with your court order, mediator, or attorney before using it as a final agreement.'
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let scheduleMap = new Map();

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
  return d.toISOString().slice(0, 10);
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
  let i = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISO(d);
    const owner = holidayOverrides.get(iso) ?? generateBaseOwner(i, config.splitType);
    scheduleMap.set(iso, owner);
    i += 1;
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

    monthEl.append(heading, daysEl);
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
    holidays: document.getElementById('holidays').value
  };
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

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loginCard.classList.add('hidden');
  plannerCard.classList.remove('hidden');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  plannerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
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

initStates();
loadFromShare();
